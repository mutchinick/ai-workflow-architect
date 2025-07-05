import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

//
//
//
const schema = z.object({
  workflowId: z.string().min(1),
  query: z.string().min(1),
})

export type UserQueryReceivedEventData = z.infer<typeof schema>

export const UserQueryReceivedEventDefinition: EventStoreEventDefinition<typeof schema> = {
  schema,
  generateIdempotencyKey: (data) => {
    return `user-query-received:${data.query}`
  },
}
