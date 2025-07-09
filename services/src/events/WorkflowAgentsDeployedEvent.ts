import { z } from 'zod'
import type { EventStoreEventDefinition } from '../event-store/EventStoreEventDefinition'
import { EventStoreEventName } from '../event-store/EventStoreEventName'

export const schema = z.object({
  workflowId: z.string().min(1),
  objectKey: z.string().min(1),
})

export type WorkflowAgentsDeployedEventData = z.infer<typeof schema>

export const WorkflowAgentsDeployedEventDefinition: EventStoreEventDefinition<WorkflowAgentsDeployedEventData> = {
  __eventName: EventStoreEventName.WORKFLOW_AGENTS_DEPLOYED,
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:objectKey:${data.objectKey}`
  },
}
