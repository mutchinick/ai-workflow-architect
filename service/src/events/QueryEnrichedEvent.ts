import { z } from 'zod'

export const schema = z.object({
  query: z.string().min(1),
  context: z.string().min(1),
})

export type QueryEnrichedEventData = z.infer<typeof schema>

const parseValidatedData = (data: unknown): QueryEnrichedEventData => {
  return schema.parse(data)
}

export const QueryEnrichedEvent = {
  parseValidatedData,
  schema,
} as const
