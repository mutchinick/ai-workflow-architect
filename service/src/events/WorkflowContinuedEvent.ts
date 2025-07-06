import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

const schema = z.object({
  workflowId: z.string().min(1),
  continued: z.literal(true),
})

export type WorkflowContinuedEventData = z.infer<typeof schema>

export const WorkflowContinuedEventDefinition: EventStoreEventDefinition<WorkflowContinuedEventData> = {
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:continued:${data.continued}`
  },
}
