import { Agent } from '../../agents/Agent'
import { WorkflowProps } from '../Workflow'

const testAgents: Agent[] = [
  { name: 'Alice', role: 'Planner', directive: 'Plan the work' },
  { name: 'Bob', role: 'Executor', directive: 'Execute the plan' },
]

const baseInstructions = {
  query: 'Develop a marketing plan for a new product.',
  enhancePromptRounds: 2,
  enhanceResultRounds: 1,
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
        stepId: 'x0001-r001-deploy-agents',
        stepStatus: 'completed',
        executionOrder: 1,
        round: 1,
        stepType: 'deploy_agents',
        prompt: baseInstructions.query,
        agents: testAgents,
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
        stepId: 'x0001-r001-deploy-agents',
        stepStatus: 'pending',
        executionOrder: 1,
        round: 1,
        stepType: 'deploy_agents',
        agents: testAgents,
        prompt: '',
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
        stepId: 'x0001-r001-deploy-agents',
        stepStatus: 'completed',
        executionOrder: 1,
        round: 1,
        stepType: 'deploy_agents',
        agents: testAgents,
        prompt: '',
      },
      {
        stepId: 'x0002-r001-enhance-prompt-Alice',
        stepStatus: 'completed',
        executionOrder: 2,
        round: 1,
        stepType: 'enhance_prompt',
        agent: testAgents[0],
      },
      {
        stepId: 'x0003-r001-enhance-prompt-Bob',
        stepStatus: 'pending',
        executionOrder: 3,
        round: 1,
        stepType: 'enhance_prompt',
        agent: testAgents[1],
      },
      {
        stepId: 'x0004-r002-enhance-prompt-Alice',
        stepStatus: 'pending',
        executionOrder: 4,
        round: 2,
        stepType: 'enhance_prompt',
        agent: testAgents[0],
      },
      {
        stepId: 'x0004-r002-enhance-prompt-Bob',
        stepStatus: 'pending',
        executionOrder: 4,
        round: 1,
        stepType: 'enhance_prompt',
        agent: testAgents[1],
      },
    ],
  },
}

export const fullyExecutedScenario: { props: WorkflowProps } = {
  props: {
    workflowId: 'mockFullId',
    instructions: { ...baseInstructions, enhancePromptRounds: 1, enhanceResultRounds: 1 },
    steps: [
      {
        stepId: 'x0001-r001-deploy-agents',
        stepStatus: 'completed',
        executionOrder: 1,
        round: 1,
        stepType: 'deploy_agents',
        agents: testAgents,
        prompt: '',
      },
      {
        stepId: 'x0002-r001-enhance-prompt-Alice',
        stepStatus: 'completed',
        executionOrder: 2,
        round: 1,
        stepType: 'enhance_prompt',
        agent: testAgents[0],
      },
      {
        stepId: 'x0003-r001-enhance-prompt-Bob',
        stepStatus: 'completed',
        executionOrder: 3,
        round: 1,
        stepType: 'enhance_prompt',
        agent: testAgents[1],
      },
      {
        stepId: 'x0004-r001-enhance-result-Alice',
        stepStatus: 'completed',
        executionOrder: 4,
        round: 1,
        stepType: 'enhance_result',
        agent: testAgents[0],
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
