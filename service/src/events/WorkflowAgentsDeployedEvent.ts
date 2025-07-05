import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

export const schema = z.object({
  workflowId: z.string().min(1),
  eventKey: z.string().min(1),
})

export type WorkflowAgentsDeployedEventData = z.infer<typeof schema>

export const WorkflowAgentsDeployedEventDefinition: EventStoreEventDefinition<WorkflowAgentsDeployedEventData> = {
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:eventKey:${data.eventKey}`
  },
}
