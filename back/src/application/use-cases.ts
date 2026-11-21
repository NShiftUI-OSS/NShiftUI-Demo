import { ConflictError, InvalidRainbowError, NotFoundError } from './errors.js'
import type { Repositories, ScreenInput } from './ports.js'

function uniqueOrConflict(error: unknown, code: string, message: string): never {
  if (isUniqueViolation(error)) throw new ConflictError(code, message)
  throw error
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  )
}

export function createUseCases(repos: Repositories) {
  const requireRainbow = (source: string) => {
    const formatted = repos.rainbow.format(source)
    if (!formatted.ok) throw new InvalidRainbowError(formatted.message)
    return formatted.formatted
  }

  return {
    screens: {
      list: () => repos.screens.list(),
      page: (query: string, page: number) => repos.screens.page(query, page),
      get: async (id: string) => {
        const row = await repos.screens.findById(id)
        if (!row) throw new NotFoundError('screen_not_found', 'Tela não existe')
        return row
      },
      getByName: async (name: string) => {
        const row = await repos.screens.findByName(name)
        if (!row) throw new NotFoundError('screen_not_found', `Tela ${name} não existe`)
        return {
          name: row.name,
          revision: row.revision,
          version: row.version,
          rainbow: row.rainbow,
          isRoot: row.isRoot,
        }
      },
      create: async (input: ScreenInput) => {
        try {
          return await repos.screens.insert({
            ...input,
            rainbow: requireRainbow(input.rainbow),
          })
        } catch (error) {
          if (error instanceof InvalidRainbowError) throw error
          uniqueOrConflict(error, 'screen_name_taken', 'Esse nome de tela já existe')
        }
      },
      update: async (
        id: string,
        input: ScreenInput & { revision: number; restoredFrom?: string },
      ) => {
        const current = await repos.screens.findById(id)
        if (!current) throw new NotFoundError('screen_not_found', 'Tela não existe')
        if (current.revision !== input.revision) {
          throw new ConflictError(
            'revision_conflict',
            'Alguém publicou esta tela enquanto você editava. Abra o editor para juntar as alterações.',
          )
        }
        try {
          const row = await repos.screens.update(id, {
            ...input,
            rainbow: requireRainbow(input.rainbow),
            restoredFrom: input.restoredFrom,
          })
          if (!row) {
            const again = await repos.screens.findById(id)
            if (!again) throw new NotFoundError('screen_not_found', 'Tela não existe')
            throw new ConflictError(
              'revision_conflict',
              'Alguém publicou esta tela enquanto você editava. Abra o editor para juntar as alterações.',
            )
          }
          return row
        } catch (error) {
          if (
            error instanceof NotFoundError ||
            error instanceof InvalidRainbowError ||
            error instanceof ConflictError
          ) {
            throw error
          }
          uniqueOrConflict(error, 'screen_name_taken', 'Esse nome de tela já existe')
        }
      },
      storyboard: async () => {
        const screens = await repos.screens.list()
        const byName = new Map(screens.map((screen) => [screen.name, screen]))
        const edges = screens.flatMap((screen) =>
          navigationEdges(screen.rainbow).map((edge, index) => {
            const target = byName.get(edge.screenName)
            return {
              id: `${screen.id}:${edge.event}:${index}`,
              source: screen.id,
              sourceName: screen.name,
              target: target?.id ?? `missing:${edge.screenName}`,
              targetName: edge.screenName,
              event: edge.event,
              async: edge.event === 'AsyncNavigateEvent',
              targetExists: Boolean(target),
            }
          }),
        )
        return { screens, edges }
      },
      remove: async (id: string) => {
        const removed = await repos.screens.delete(id)
        if (!removed) throw new NotFoundError('screen_not_found', 'Tela não existe')
      },
      versions: async (id: string) => {
        const screen = await repos.screens.findById(id)
        if (!screen) throw new NotFoundError('screen_not_found', 'Tela não existe')
        return repos.screens.versions(id)
      },
      activate: async (id: string, version: string, revision: number) => {
        const screen = await repos.screens.findById(id)
        if (!screen) throw new NotFoundError('screen_not_found', 'Tela não existe')
        if (screen.revision !== revision) {
          throw new ConflictError(
            'revision_conflict',
            'Alguém publicou esta tela enquanto você editava. Abra o editor para juntar as alterações.',
          )
        }
        const history = await repos.screens.versions(id)
        if (!history.some((item) => item.version === version)) {
          throw new NotFoundError('screen_version_not_found', 'Versão não existe')
        }
        const row = await repos.screens.activate(id, version, revision)
        if (!row) {
          throw new ConflictError(
            'revision_conflict',
            'Alguém publicou esta tela enquanto você editava. Abra o editor para juntar as alterações.',
          )
        }
        return row
      },
    },
    audit: {
      page: (action: string, page: number) => repos.audit.page(action, page),
    },
  }
}

function navigationEdges(source: string) {
  const pattern =
    /\b(NavigateEvent|AsyncNavigateEvent)\s*\(\s*screenName\s*:\s*"((?:\\.|[^"\\])*)"/g
  const edges: { event: string; screenName: string }[] = []
  for (const match of source.matchAll(pattern)) {
    const rawName = match[2]
    let screenName = rawName
    try {
      screenName = JSON.parse(`"${rawName}"`) as string
    } catch {
      // The Rainbow parser already validates the source before persistence.
    }
    if (screenName.trim()) {
      edges.push({ event: match[1], screenName })
    }
  }
  return edges
}
