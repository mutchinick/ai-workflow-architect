import { z } from 'zod'
import type { EventStoreEventDefinition } from '../event-store/EventStoreEventDefinition'
import { EventStoreEventName } from '../event-store/EventStoreEventName'

const schema = z.object({
  workflowId: z.string().min(1),
  continued: z.literal(true),
})

export type WorkflowContinuedEventData = z.infer<typeof schema>

export const WorkflowContinuedEventDefinition: EventStoreEventDefinition<WorkflowContinuedEventData> = {
  __eventName: EventStoreEventName.WORKFLOW_CONTINUED,
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:continued:${data.continued}`
  },
}
