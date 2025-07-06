import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'
import { EventStoreEventName } from './EventStoreEventName'

export const schema = z.object({
  workflowId: z.string().min(1),
  objectKey: z.string().min(1),
})

export type WorkflowPromptCompletedEventData = z.infer<typeof schema>

export const WorkflowPromptCompletedEventDefinition: EventStoreEventDefinition<WorkflowPromptCompletedEventData> = {
  __eventName: EventStoreEventName.WORKFLOW_PROMPT_COMPLETED,
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:objectKey:${data.objectKey}`
  },
}
