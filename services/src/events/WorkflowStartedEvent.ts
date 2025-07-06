import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

const schema = z.object({
  workflowId: z.string().min(1),
  started: z.literal(true),
})

export type WorkflowStartedEventData = z.infer<typeof schema>

export const WorkflowStartedEventDefinition: EventStoreEventDefinition<WorkflowStartedEventData> = {
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:started:${data.started}`
  },
}
