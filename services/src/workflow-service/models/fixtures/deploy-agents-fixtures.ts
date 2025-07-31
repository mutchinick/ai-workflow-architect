import { Agent } from '../../agents/Agent'
import { WorkflowStep } from '../WorkflowStep'

export const singleAgent: Agent[] = [
  {
    name: 'Agent-01',
    role: 'Agent-01-Role',
    directive: 'Agent-01-Directive',
    system: 'Agent-01-System',
    prompt: 'Agent-01-Prompt',
    phaseName: 'Agent-01-Phase',
  },
]

export const multiAgents: Agent[] = [
  {
    name: 'Agent-01',
    role: 'Agent-01-Role',
    directive: 'Agent-01-Directive',
    system: 'Agent-01-System',
    prompt: 'Agent-01-Prompt',
    phaseName: 'Agent-01-Phase',
  },
  {
    name: 'Agent-02',
    role: 'Agent-02-Role',
    directive: 'Agent-02-Directive',
    system: 'Agent-02-System',
    prompt: 'Agent-02-Prompt',
    phaseName: 'Agent-02-Phase',
  },
]

export const duplicateNameAgents: Agent[] = [
  {
    name: 'Agent-01',
    role: 'Agent-01-Role',
    directive: 'Agent-01-Directive',
    system: 'Agent-01-System',
    prompt: 'Agent-01-Prompt',
    phaseName: 'Agent-01-Phase',
  },
  {
    name: 'Agent-01', // Duplicate name
    role: 'Agent-02-Role',
    directive: 'Agent-02-Directive',
    system: 'Agent-02-System',
    prompt: 'Agent-02-Prompt',
    phaseName: 'Agent-02-Phase',
  },
]

export const singleAgentScenario = {
  agents: singleAgent,
  instructions: { query: 'mockQuery' },
}

export const multiAgentScenario = {
  agents: multiAgents,
  instructions: { query: 'mockQuery' },
}

export const preexistingStepsScenario = {
  agents: [
    {
      name: 'Agent-XX',
      role: 'Role-XX',
      directive: 'Directive-XX',
      system: 'System-XX',
      prompt: 'Prompt-XX',
      phaseName: 'Phase-XX',
    },
  ],
  instructions: { query: 'mockQuery' },
  initialSteps: [
    {
      stepId: 'x0001-deploy-agents',
      stepStatus: 'completed',
      executionOrder: 1,
      llmSystem: 'mockSystem',
      llmPrompt: 'mockPrompt',
      llmResult: 'mockResult',
      agent: singleAgent[0],
    },
  ] as WorkflowStep[],
}
