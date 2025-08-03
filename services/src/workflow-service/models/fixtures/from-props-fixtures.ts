import { Assistant } from '../../assistants/Assistant'
import { WorkflowProps } from '../Workflow'

const mockAssistants: Assistant[] = [
  {
    name: 'Assistant-01',
    role: 'Assistant-01-Role',
    directive: 'Assistant-01-Directive',
    system: 'Assistant-01-System',
    prompt: 'Assistant-01-Prompt',
    phaseName: 'Assistant-01-Phase',
  },
  {
    name: 'Assistant-02',
    role: 'Assistant-02-Role',
    directive: 'Assistant-02-Directive',
    system: 'Assistant-02-System',
    prompt: 'Assistant-02-Prompt',
    phaseName: 'Assistant-02-Phase',
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
        stepId: 'x0001-deploy-assistants',
        stepStatus: 'completed',
        executionOrder: 1,
        assistant: mockAssistants[0],
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
        stepId: 'x0001-deploy-assistants',
        stepStatus: 'pending',
        executionOrder: 1,
        assistant: mockAssistants[0],
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
        stepId: 'x0001-deploy-assistants',
        stepStatus: 'completed',
        executionOrder: 1,
        llmSystem: 'mockSystem',
        llmPrompt: 'mockPrompt',
        llmResult: 'mockResult',
        assistant: mockAssistants[0],
      },
      {
        stepId: 'x0002-assistant-Assistant-01',
        stepStatus: 'completed',
        executionOrder: 2,
        assistant: mockAssistants[0],
        llmSystem: mockAssistants[0].system,
        llmPrompt: mockAssistants[0].prompt,
        llmResult: '',
      },
      {
        stepId: 'x0003-assistant-Assistant-02',
        stepStatus: 'pending',
        executionOrder: 3,
        assistant: mockAssistants[1],
        llmSystem: mockAssistants[1].system,
        llmPrompt: mockAssistants[1].prompt,
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
        stepId: 'x0001-deploy-assistants',
        stepStatus: 'completed',
        executionOrder: 1,
        assistant: mockAssistants[0],
        llmSystem: 'mockSystem',
        llmPrompt: 'mockPrompt',
        llmResult: 'mockResult',
      },
      {
        stepId: 'x0002-assistant-Assistant-01',
        stepStatus: 'completed',
        executionOrder: 2,
        assistant: mockAssistants[0],
        llmSystem: mockAssistants[0].system,
        llmPrompt: mockAssistants[0].prompt,
        llmResult: 'mockEnhanceResult',
      },
      {
        stepId: 'x0003-assistant-Assistant-02',
        stepStatus: 'completed',
        executionOrder: 3,
        assistant: mockAssistants[1],
        llmSystem: mockAssistants[1].system,
        llmPrompt: mockAssistants[1].prompt,
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
