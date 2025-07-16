import { Agent } from '../Agent'
import { WorkflowProps } from '../Workflow'

const testAgents: Agent[] = [
  { name: 'Alice', role: 'Planner', directive: 'Plan the work' },
  { name: 'Bob', role: 'Executor', directive: 'Execute the plan' },
]

const baseInput = {
  query: 'Develop a marketing plan for a new product.',
  enhancePromptRounds: 2,
  enhanceResultRounds: 1,
}

export const workflowScenarios: { name: string; props: WorkflowProps }[] = [
  {
    name: 'Scenario 1: Empty Workflow (Just created from input)',
    props: {
      workflowId: 'ksuid_empty_workflow_123',
      input: baseInput,
      steps: [],
    },
  },
  {
    name: 'Scenario 2: Initial Step Only (Deploy Agents Completed)',
    props: {
      workflowId: 'ksuid_initial_step_456',
      input: baseInput,
      steps: [
        {
          stepId: 'deploy-agents-round-1-1',
          stepName: 'Deploy Agents round 1',
          stepStatus: 'completed',
          executionOrder: 1,
          round: 1,
          stepType: 'deploy_agents',
          prompt: baseInput.query,
          agents: testAgents,
        },
        // Note: In a real scenario, setAgents would create the pending steps too.
        // This scenario specifically tests the state *after* only the first step is done.
      ],
    },
  },
  {
    name: 'Scenario 3: Partially Executed Workflow',
    props: {
      workflowId: 'ksuid_partial_exec_789',
      input: baseInput,
      steps: [
        {
          stepId: 'deploy-agents-round-1-1',
          stepName: 'Deploy Agents round 1',
          stepStatus: 'completed',
          executionOrder: 1,
          round: 1,
          stepType: 'deploy_agents',
          prompt: baseInput.query,
          agents: testAgents,
        },
        {
          stepId: 'enhance-prompt-Alice-round-1-2',
          stepStatus: 'completed',
          stepName: 'Enhance prompt with Alice round 1',
          executionOrder: 2,
          round: 1,
          stepType: 'enhance_prompt',
          agent: testAgents[0],
          prompt: baseInput.query,
          result: 'A more detailed marketing plan prompt.',
        },
        {
          stepId: 'enhance-prompt-Bob-round-1-2',
          stepStatus: 'pending', // This is the next step
          stepName: 'Enhance prompt with Bob round 1',
          executionOrder: 2,
          round: 1,
          stepType: 'enhance_prompt',
          agent: testAgents[1],
          prompt: 'A more detailed marketing plan prompt.',
          result: '',
        },
        {
          stepId: 'enhance-prompt-Alice-round-2-3',
          stepStatus: 'pending',
          stepName: 'Enhance prompt with Alice round 2',
          executionOrder: 3,
          round: 2,
          stepType: 'enhance_prompt',
          agent: testAgents[0],
        },
      ],
    },
  },
  {
    name: 'Scenario 4: Fully Executed Workflow',
    props: {
      workflowId: 'ksuid_fully_exec_abc',
      input: { ...baseInput, enhancePromptRounds: 1, enhanceResultRounds: 1 },
      steps: [
        {
          stepId: 'deploy-agents-round-1-1',
          stepName: 'Deploy Agents round 1',
          stepStatus: 'completed',
          executionOrder: 1,
          round: 1,
          stepType: 'deploy_agents',
          prompt: baseInput.query,
          agents: testAgents,
        },
        {
          stepId: 'enhance-prompt-Alice-round-1-2',
          stepStatus: 'completed',
          stepName: 'Enhance prompt with Alice round 1',
          executionOrder: 2,
          round: 1,
          stepType: 'enhance_prompt',
          agent: testAgents[0],
          prompt: baseInput.query,
          result: 'Enhanced prompt v1',
        },
        {
          stepId: 'enhance-prompt-Bob-round-1-2',
          stepStatus: 'completed',
          stepName: 'Enhance prompt with Bob round 1',
          executionOrder: 2,
          round: 1,
          stepType: 'enhance_prompt',
          agent: testAgents[1],
          prompt: 'Enhanced prompt v1',
          result: 'Enhanced prompt v2',
        },
        {
          stepId: 'enhance-result-Alice-round-1-3',
          stepStatus: 'completed',
          stepName: 'Enhance result with Alice round 1',
          executionOrder: 3,
          round: 1,
          stepType: 'enhance_result',
          agent: testAgents[0],
          prompt: 'Enhanced prompt v2',
          result: 'Final result v1',
        },
      ],
    },
  },
]
