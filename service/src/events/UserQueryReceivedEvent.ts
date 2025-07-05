import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

//
//
//
const schema = z.object({
  workflowId: z.string().min(1),
  query: z.string().min(1),
})

export type UserQueryReceivedEventData = {
  workflowId: string
  query: string
}

export const UserQueryReceivedEventDefinition: EventStoreEventDefinition<UserQueryReceivedEventData> = {
  parseValidate: (data) => {
    return schema.parse(data) as UserQueryReceivedEventData
  },
  generateIdempotencyKey: (data) => {
    return `user-query-received:${data.query}`
  },
}
