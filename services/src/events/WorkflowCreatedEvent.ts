import { z } from 'zod'
import type { EventStoreEventDefinition } from './EventStoreEventDefinition'
import { EventStoreEventName } from './EventStoreEventName'

const schema = z.object({
  workflowId: z.string().min(1),
  promptEnhancementRounds: z.number().int().min(1).max(10),
  responseEnhancementRounds: z.number().int().min(1).max(10),
  objectKey: z.string().min(1),
})

export type WorkflowCreatedEventData = z.infer<typeof schema>

export const WorkflowCreatedEventDefinition: EventStoreEventDefinition<WorkflowCreatedEventData> = {
  __eventName: EventStoreEventName.WORKFLOW_CREATED,
  parseValidate: (data) => {
    return schema.parse(data)
  },
  generateIdempotencyKey: (data) => {
    return `workflowId:${data.workflowId}:objectKey:${data.objectKey}`
  },
}
