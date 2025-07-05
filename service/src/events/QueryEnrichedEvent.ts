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

export type QueryEnrichedEventData = {
  workflowId: string
  query: string
  context: string
}

export const QueryEnrichedEventDefinition: EventStoreEventDefinition<QueryEnrichedEventData> = {
  parseValidate: (data) => {
    return schema.parse(data) as QueryEnrichedEventData
  },
  generateIdempotencyKey: (data) => {
    return `user-query-received:${data.query}`
  },
}
