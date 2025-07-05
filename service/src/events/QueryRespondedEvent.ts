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

export type QueryRespondedEventData = {
  workflowId: string
  query: string
  response: string
}

export const QueryRespondedEventDefinition: EventStoreEventDefinition<QueryRespondedEventData> = {
  parseValidate: (data) => {
    return schema.parse(data) as QueryRespondedEventData
  },
  generateIdempotencyKey: (data) => {
    return `user-query-received:${data.query}`
  },
}
