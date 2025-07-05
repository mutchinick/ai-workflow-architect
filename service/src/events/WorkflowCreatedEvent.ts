import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

const schema = z.object({
  workflowId: z.string().min(1),
  eventKey: z.string().min(1),
})

export type WorkflowCreatedEventData = z.infer<typeof schema>

export const WorkflowCreatedEventDefinition: EventStoreEventDefinition<WorkflowCreatedEventData> = {
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:eventKey:${data.eventKey}`
  },
}
