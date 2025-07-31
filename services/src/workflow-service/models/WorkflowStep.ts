import { z } from 'zod'
import { agentSchema } from '../agents/Agent'

/**
 *
 */
export const workflowStepSchema = z.object({
  stepId: z.string(),
  stepStatus: z.enum(['pending', 'completed']),
  executionOrder: z.number().int(),
  agent: agentSchema,
  llmSystem: z.string(),
  llmPrompt: z.string(),
  llmResult: z.string(),
})

export type WorkflowStep = z.infer<typeof workflowStepSchema>
