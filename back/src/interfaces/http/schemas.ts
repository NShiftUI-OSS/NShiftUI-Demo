import { z } from 'zod'

import { screenName } from '../../domain/values.js'

export const screenBody = z.object({
  name: z.string().transform(screenName),
  description: z.string().default(''),
  rainbow: z.string().optional(),
  isRoot: z.boolean().default(false),
})

export const screenUpdateBody = screenBody.extend({
  revision: z.number().int().nonnegative(),
  restoredFrom: z.string().trim().optional(),
})

export const auditListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  action: z
    .enum(['', 'screen.created', 'screen.published', 'screen.deleted', 'screen.activated'])
    .default(''),
})

export const activateVersionBody = z.object({
  revision: z.number().int().nonnegative(),
})

export const versionParam = z.object({
  id: z.uuid(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
})

export const screenListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  q: z.string().trim().default(''),
})

export const idParam = z.object({
  id: z.uuid(),
})

export const nameParam = z.object({
  name: z.string().transform(screenName),
})
