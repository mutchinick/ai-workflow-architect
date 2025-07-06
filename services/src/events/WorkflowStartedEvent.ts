import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'
import { EventStoreEventName } from './EventStoreEventName'

const schema = z.object({
  workflowId: z.string().min(1),
  started: z.literal(true),
})

export type WorkflowStartedEventData = z.infer<typeof schema>

export const WorkflowStartedEventDefinition: EventStoreEventDefinition<WorkflowStartedEventData> = {
  __eventName: EventStoreEventName.WORKFLOW_STARTED,
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:started:${data.started}`
  },
}
