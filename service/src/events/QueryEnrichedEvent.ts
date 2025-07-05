import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

//
//
//
export const schema = z.object({
  workflowId: z.string().min(1),
  query: z.string().min(1),
  context: z.string().min(1),
})

export type QueryEnrichedEventData = z.infer<typeof schema>

export const QueryEnrichedEventDefinition: EventStoreEventDefinition<typeof schema> = {
  schema,
  generateIdempotencyKey: (data) => {
    return `user-query-received:${data.query}`
  },
}
