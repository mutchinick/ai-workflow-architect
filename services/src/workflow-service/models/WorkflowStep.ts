import { z } from 'zod'
import { agentSchema } from './Agent'

/**
 *
 */
const baseStepProperties = {
  stepId: z.string(),
  stepStatus: z.enum(['pending', 'completed']),
  round: z.number(),
  executionOrder: z.number().int(),
}

/**
 *
 */
export const workflowStepSchema = z.discriminatedUnion('stepType', [
  // Schema for a "deploy_agents" step
  z.object({
    ...baseStepProperties,
    stepType: z.literal('deploy_agents'),
    prompt: z.string(),
    result: z.string().optional(),
    agents: z.array(agentSchema),
  }),
  // Schema for a "enhance_prompt" step
  z.object({
    ...baseStepProperties,
    stepType: z.literal('enhance_prompt'),
    agent: agentSchema,
    prompt: z.string().optional(),
    result: z.string().optional(),
  }),
  // Schema for a "respond_prompt" step
  z.object({
    ...baseStepProperties,
    stepType: z.literal('respond_prompt'),
    agent: agentSchema,
    prompt: z.string().optional(),
    result: z.string().optional(),
  }),
  // Schema for a "enhance_result" step
  z.object({
    ...baseStepProperties,
    stepType: z.literal('enhance_result'),
    agent: agentSchema,
    prompt: z.string().optional(),
    result: z.string().optional(),
    reason: z.string().optional(),
    score: z.number().optional(),
  }),
])

export type WorkflowStep = z.infer<typeof workflowStepSchema>
