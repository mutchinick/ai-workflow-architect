import { Agent } from '../../agents/Agent'
import { WorkflowStep } from '../WorkflowStep'

export const singleAgent: Agent[] = [
  { name: 'Copernicus', role: 'Researcher', directive: 'Provide foundational answer.' },
]

export const multiAgents: Agent[] = [
  { name: 'Architect', role: 'Designer', directive: 'Design the structure.' },
  { name: 'Critic', role: 'QA', directive: 'Review for flaws.' },
]

export const firstResponder: Agent = {
  name: 'First Responder',
  role: 'Responder',
  directive: 'Provide the first response.',
}

export const duplicateNameAgents: Agent[] = [
  { name: 'Validator', role: 'Reviewer', directive: 'Review the work.' },
  { name: 'Validator', role: 'Approver', directive: 'Approve the work.' },
]

export const singleAgentScenario = {
  agents: singleAgent,
  instructions: { query: 'Test Query 1', enhancePromptRounds: 1, enhanceResultRounds: 1 },
}

export const multiAgentScenario = {
  agents: multiAgents,
  instructions: { query: 'Test Query 2', enhancePromptRounds: 2, enhanceResultRounds: 1 },
}

export const preexistingStepsScenario = {
  agents: [{ name: 'Late Agent', role: 'Test', directive: 'Test' }],
  instructions: { query: 'mockQuery', enhancePromptRounds: 1, enhanceResultRounds: 1 },
  initialSteps: [
    {
      stepId: 'existing-step',
      stepStatus: 'pending',
      executionOrder: 1,
      round: 1,
      stepType: 'enhance_prompt',
      agent: { name: 'A', role: 'B', directive: 'C' },
    },
  ] as WorkflowStep[],
}
