import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify from 'fastify'
import type { ZodType } from 'zod'

import { ConflictError, InvalidRainbowError, NotFoundError } from '../../application/errors.js'
import type { Container } from '../../composition/container.js'
import { DomainError, defaultRainbow } from '../../domain/values.js'
import { openapi } from './openapi.js'
import {
  auditListQuery,
  idParam,
  nameParam,
  screenBody,
  screenListQuery,
  screenUpdateBody,
} from './schemas.js'

type UseCases = Container['useCases']

export function createApp(
  useCases: UseCases,
  options: { https?: { key: Buffer; cert: Buffer } } = {},
) {
  const app = Fastify({ logger: true, ...options })
  app.register(cors, {
    origin: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
  app.register(swagger, {
    mode: 'static',
    specification: { document: openapi },
  })
  app.register(swaggerUi, { routePrefix: '/docs' })

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainError) {
      return reply.status(400).send(errorBody(400, 'invalid_body', error.message))
    }
    if (error instanceof NotFoundError) {
      return reply.status(404).send(errorBody(404, error.code, error.message))
    }
    if (error instanceof ConflictError) {
      return reply.status(409).send(errorBody(409, error.code, error.message))
    }
    if (error instanceof InvalidRainbowError) {
      return reply.status(422).send(errorBody(422, 'invalid_rainbow', error.message))
    }
    if (error.statusCode === 400) {
      return reply.status(400).send(errorBody(400, 'invalid_body', error.message))
    }
    app.log.error(error)
    return reply.status(500).send(errorBody(500, 'internal', 'Falha interna'))
  })

  app.get('/health', async () => ({ data: { status: 'up' } }))

  app.get('/screens', async (request) => {
    const query = parse(screenListQuery, request.query)
    return { data: await useCases.screens.page(query.q, query.page) }
  })
  app.get('/screens/:id', async (request) => ({
    data: await useCases.screens.get(parse(idParam, request.params).id),
  }))
  app.post('/screens', async (request, reply) => {
    const body = parse(screenBody, request.body)
    const created = await useCases.screens.create({
      name: body.name,
      description: body.description,
      rainbow: body.rainbow ?? defaultRainbow(body.name),
      isRoot: body.isRoot,
    })
    return reply.status(201).send({ data: created })
  })
  app.put('/screens/:id', async (request) => {
    const id = parse(idParam, request.params).id
    const body = parse(screenUpdateBody, request.body)
    const current = await useCases.screens.get(id)
    const updated = await useCases.screens.update(id, {
      name: body.name,
      description: body.description,
      rainbow: body.rainbow ?? current.rainbow,
      isRoot: body.isRoot,
      revision: body.revision,
      restoredFrom: body.restoredFrom,
    })
    return { data: updated }
  })
  app.get('/screens/:id/versions', async (request) => ({
    data: await useCases.screens.versions(parse(idParam, request.params).id),
  }))
  app.get('/audit', async (request) => {
    const query = parse(auditListQuery, request.query)
    return { data: await useCases.audit.page(query.action, query.page) }
  })
  app.delete('/screens/:id', async (request) => {
    await useCases.screens.remove(parse(idParam, request.params).id)
    return { data: null }
  })

  app.get('/runtime/screens/:name', async (request) => ({
    data: await useCases.screens.getByName(parse(nameParam, request.params).name),
  }))
  app.get('/storyboard', async () => ({
    data: await useCases.screens.storyboard(),
  }))

  return app
}

function parse<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new DomainError('Corpo ou parâmetro inválido')
  }
  return result.data
}

function errorBody(status: number, code: string, message: string) {
  return { error: { status, code, message } }
}
