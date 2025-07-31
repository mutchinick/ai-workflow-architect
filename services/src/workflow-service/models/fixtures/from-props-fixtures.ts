import { Agent } from '../../agents/Agent'
import { WorkflowProps } from '../Workflow'

const testAgents: Agent[] = [
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

const baseInstructions = {
  query: 'Develop a marketing plan for a new product.',
}

export const emptyWorkflowScenario: { props: WorkflowProps } = {
  props: {
    workflowId: 'mockWorkflowId',
    instructions: baseInstructions,
    steps: [],
  },
}

export const initialStepValidScenario: { props: WorkflowProps } = {
  props: {
    workflowId: 'mockInitialId',
    instructions: baseInstructions,
    steps: [
      {
        stepId: 'x0001-deploy-agents',
        stepStatus: 'completed',
        executionOrder: 1,
        agent: testAgents[0],
        llmSystem: 'mockSystem',
        llmPrompt: 'mockPrompt',
        llmResult: 'mockResult',
      },
    ],
  },
}

export const noStepsExecutedScenario: { props: WorkflowProps } = {
  props: {
    workflowId: 'mockNoExecId',
    instructions: baseInstructions,
    steps: [
      {
        stepId: 'x0001-deploy-agents',
        stepStatus: 'pending',
        executionOrder: 1,
        agent: testAgents[0],
        llmSystem: 'mockSystem',
        llmPrompt: 'mockPrompt',
        llmResult: '',
      },
    ],
  },
}

export const partiallyExecutedScenario: { props: WorkflowProps } = {
  props: {
    workflowId: 'mockPartialId',
    instructions: baseInstructions,
    steps: [
      {
        stepId: 'x0001-deploy-agents',
        stepStatus: 'completed',
        executionOrder: 1,
        llmSystem: 'mockSystem',
        llmPrompt: 'mockPrompt',
        llmResult: 'mockResult',
        agent: testAgents[0],
      },
      {
        stepId: 'x0002-agent-Agent-01',
        stepStatus: 'completed',
        executionOrder: 2,
        agent: testAgents[0],
        llmSystem: testAgents[0].system,
        llmPrompt: testAgents[0].prompt,
        llmResult: '',
      },
      {
        stepId: 'x0003-agent-Agent-02',
        stepStatus: 'pending',
        executionOrder: 3,
        agent: testAgents[1],
        llmSystem: testAgents[1].system,
        llmPrompt: testAgents[1].prompt,
        llmResult: '',
      },
    ],
  },
}

export const fullyExecutedScenario: { props: WorkflowProps } = {
  props: {
    workflowId: 'mockFullId',
    instructions: baseInstructions,
    steps: [
      {
        stepId: 'x0001-deploy-agents',
        stepStatus: 'completed',
        executionOrder: 1,
        agent: testAgents[0],
        llmSystem: 'mockSystem',
        llmPrompt: 'mockPrompt',
        llmResult: 'mockResult',
      },
      {
        stepId: 'x0002-agent-Agent-01',
        stepStatus: 'completed',
        executionOrder: 2,
        agent: testAgents[0],
        llmSystem: testAgents[0].system,
        llmPrompt: testAgents[0].prompt,
        llmResult: 'mockEnhanceResult',
      },
      {
        stepId: 'x0003-agent-Agent-02',
        stepStatus: 'completed',
        executionOrder: 3,
        agent: testAgents[1],
        llmSystem: testAgents[1].system,
        llmPrompt: testAgents[1].prompt,
        llmResult: 'mockEnhanceResult',
      },
    ],
  },
}

export const invalidIdScenario: { props: WorkflowProps } = {
  props: {
    workflowId: '',
    instructions: baseInstructions,
    steps: [],
  },
}

export const invalidInstructionsScenario: { props: WorkflowProps } = {
  props: {
    workflowId: 'mockWorkflowId',
    instructions: { query: 'bad' } as never,
    steps: [],
  },
}
