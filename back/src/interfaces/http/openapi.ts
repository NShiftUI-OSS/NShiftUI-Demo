const error = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['status', 'code', 'message'],
      properties: {
        status: { type: 'integer' },
        code: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
} as const

const metadata = { type: 'object', additionalProperties: true }

const plugin = {
  type: 'object',
  required: ['id', 'name', 'version', 'metadata', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    version: { type: 'string' },
    metadata,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
}

const event = {
  type: 'object',
  required: ['id', 'name', 'version', 'trigger', 'metadata', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    version: { type: 'string' },
    trigger: { type: 'string' },
    metadata,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
}

const trigger = {
  type: 'object',
  required: ['id', 'name', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
}

const screen = {
  type: 'object',
  required: ['id', 'name', 'description', 'rainbow', 'revision', 'version', 'createdAt', 'updatedAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string' },
    rainbow: { type: 'string' },
    revision: { type: 'integer', description: 'Token do PUT. Não é o SemVer mostrado no editor.' },
    version: { type: 'string', description: 'SemVer atual. O patch sobe quando a gravação muda a tela.' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
}

const runtimeScreen = {
  type: 'object',
  required: ['name', 'revision', 'version', 'rainbow'],
  properties: {
    name: { type: 'string' },
    revision: { type: 'integer' },
    version: { type: 'string' },
    rainbow: { type: 'string' },
  },
}

function data(schema: object) {
  return {
    type: 'object',
    required: ['data'],
    properties: { data: schema },
  }
}

function resourcePaths(
  name: string,
  body: object,
  record: object,
) {
  return {
    [`/${name}`]: {
      get: {
        tags: [name],
        responses: { '200': { description: 'Lista', content: { 'application/json': { schema: data({ type: 'array', items: record }) } } } },
      },
      post: {
        tags: [name],
        requestBody: { required: true, content: { 'application/json': { schema: body } } },
        responses: {
          '201': { description: 'Criado', content: { 'application/json': { schema: data(record) } } },
          '400': { description: 'Corpo inválido', content: { 'application/json': { schema: error } } },
          '409': { description: 'Nome já existe', content: { 'application/json': { schema: error } } },
        },
      },
    },
    [`/${name}/{id}`]: {
      get: {
        tags: [name],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Registro', content: { 'application/json': { schema: data(record) } } },
          '404': { description: 'Não existe', content: { 'application/json': { schema: error } } },
        },
      },
      put: {
        tags: [name],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: body } } },
        responses: {
          '200': { description: 'Atualizado', content: { 'application/json': { schema: data(record) } } },
          '400': { description: 'Corpo inválido', content: { 'application/json': { schema: error } } },
          '404': { description: 'Não existe', content: { 'application/json': { schema: error } } },
          '409': { description: 'Nome repetido ou revisão desatualizada', content: { 'application/json': { schema: error } } },
        },
      },
      delete: {
        tags: [name],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Apagado', content: { 'application/json': { schema: data({ type: 'null' }) } } },
          '404': { description: 'Não existe', content: { 'application/json': { schema: error } } },
        },
      },
    },
  }
}

const pluginBody = {
  type: 'object',
  required: ['name', 'version'],
  properties: { name: { type: 'string' }, version: { type: 'string' }, metadata },
}

const eventBody = {
  type: 'object',
  required: ['name', 'version', 'trigger'],
  properties: {
    name: { type: 'string' },
    version: { type: 'string' },
    trigger: { type: 'string' },
    metadata,
  },
}

const triggerBody = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string' } },
}

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'NShift CMS',
    version: '0.0.0',
    description: 'Monólito da POC. Sucesso devolve data. Erro devolve error. O status HTTP escolhe o objeto.',
  },
  paths: {
    '/health': {
      get: {
        tags: ['health'],
        responses: { '200': { description: 'Processo no ar', content: { 'application/json': { schema: data({ type: 'object', properties: { status: { type: 'string' } } }) } } } },
      },
    },
    ...resourcePaths('screens', {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        rainbow: { type: 'string' },
        revision: { type: 'integer', description: 'Obrigatória no PUT. É a revisão que o cliente editou.' },
      },
    }, screen),
    '/runtime/screens/{name}': {
      get: {
        tags: ['runtime'],
        parameters: [{ name: 'name', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Fonte Rainbow da tela', content: { 'application/json': { schema: data(runtimeScreen) } } },
          '404': { description: 'Tela não existe', content: { 'application/json': { schema: error } } },
        },
      },
    },
  },
}
