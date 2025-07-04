import { z } from 'zod'

//
//
//
export const schema = z.object({
  query: z.string().min(1),
  response: z.string().min(1),
})

export type QueryRespondedEventData = z.infer<typeof schema>

const parseValidatedData = (data: unknown): QueryRespondedEventData => {
  return schema.parse(data)
}

export const QueryRespondedEvent = {
  parseValidatedData,
  schema,
} as const
