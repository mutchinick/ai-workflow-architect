import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

//
//
//
export const schema = z.object({
  workflowId: z.string().min(1),
  query: z.string().min(1),
  context: z.string().min(1),
  grade: z.union([
    z.literal(10),
    z.literal(9),
    z.literal(8),
    z.literal(7),
    z.literal(6),
    z.literal(5),
    z.literal(4),
    z.literal(3),
    z.literal(2),
    z.literal(1),
    z.literal(0),
  ]),
})

export type EnrichedQueryGradedEventData = z.infer<typeof schema>

export const EnrichedQueryGradedEventDefinition: EventStoreEventDefinition<typeof schema> = {
  schema,
  generateIdempotencyKey: (data) => {
    return `user-query-received:${data.query}`
  },
}
