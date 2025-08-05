import { z } from 'zod'
import { assistantSchema } from '../assistants/Assistant'

/**
 *
 */
export const workflowStepSchema = z.object({
  stepId: z.string(),
  stepStatus: z.enum(['pending', 'completed']),
  executionOrder: z.number().int(),
  assistant: assistantSchema,
  llmSystem: z.string(),
  llmPrompt: z.string(),
  llmResult: z.string(),
})

export type WorkflowStep = z.infer<typeof workflowStepSchema>
