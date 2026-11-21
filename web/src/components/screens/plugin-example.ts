import type { ScreenComponentDefinition } from '@/components/screens/preview/types'
import { previewPluginName } from '@/di/registrations'
import { fieldsFor, type PluginField } from '@/scn/plugin-fields'

export function pluginRainbowExample(component: ScreenComponentDefinition) {
  const name = previewPluginName(component.id)
  const params = fieldsFor(component.id).flatMap((field) => {
    const printed = printField(field)
    return printed ? [printed] : []
  })
  const child = exampleChild(component)
  const uses = [`use ${name}@1.0.0`]
  if (child) uses.push(`use ${child.use}@1.0.0`)
  return `${uses.join('\n')}\n\n${printCall(name, params, child?.body ?? null)}\n`
}

function exampleChild(component: ScreenComponentDefinition) {
  if (!component.acceptsChildren) return null
  if (component.id === 'tab-bar') {
    return {
      use: 'Tab',
      body: '  Tab(\n    title: "Aba",\n    icon: "house"\n  )',
    }
  }
  return { use: 'Text', body: '  Text(text: "Conteúdo")' }
}

function printCall(name: string, params: string[], block: string | null) {
  const head =
    params.length === 0
      ? `${name}()`
      : params.length === 1
        ? `${name}(${params[0]})`
        : `${name}(\n${params.map((line) => `  ${line}`).join(',\n')}\n)`
  if (!block) return head
  return `${head} {\n${block}\n}`
}

function printField(field: PluginField) {
  const value = field.defaultValue
  if (field.kind === 'boolean') {
    return `${field.name}: ${value === 'true' ? 'true' : 'false'}`
  }
  if (field.kind === 'number') {
    if (!value.trim()) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? `${field.name}: ${parsed}` : null
  }
  if (field.kind === 'select') {
    const token = (value || field.options?.[0] || '').replace(/^\./, '')
    return token ? `${field.name}: "${escapeString(token)}"` : null
  }
  if (field.kind === 'list') {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    if (items.length === 0) return null
    return `${field.name}: [${items.map((item) => `"${escapeString(item)}"`).join(', ')}]`
  }
  if (!value.trim()) return null
  return `${field.name}: "${escapeString(value)}"`
}

function escapeString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}
