import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'

export const schema = z.object({
  workflowId: z.string().min(1),
  objectKey: z.string().min(1),
  agentId: z.string().min(1),
  round: z.number().int().min(0),
})

export type WorkflowPromptEnhancedEventData = z.infer<typeof schema>

export const WorkflowPromptEnhancedEventDefinition: EventStoreEventDefinition<WorkflowPromptEnhancedEventData> = {
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:objectKey:${data.objectKey}`
  },
}
