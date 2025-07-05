import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

//
//
//
export const schema = z.object({
  workflowId: z.string().min(1),
  query: z.string().min(1),
  response: z.string().min(1),
})

export type QueryRespondedEventData = z.infer<typeof schema>

export const QueryRespondedEventDefinition: EventStoreEventDefinition<typeof schema> = {
  schema,
  generateIdempotencyKey: (data) => {
    return `user-query-received:${data.query}`
  },
}
