import { Assistant } from '../../assistants/Assistant'
import { WorkflowStep } from '../WorkflowStep'

export const singleAssistant: Assistant[] = [
  {
    name: 'Assistant-01',
    role: 'Assistant-01-Role',
    directive: 'Assistant-01-Directive',
    system: 'Assistant-01-System',
    prompt: 'Assistant-01-Prompt',
    phaseName: 'Assistant-01-Phase',
  },
]

export const multiAssistants: Assistant[] = [
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

export const duplicateNameAssistants: Assistant[] = [
  {
    name: 'Assistant-01',
    role: 'Assistant-01-Role',
    directive: 'Assistant-01-Directive',
    system: 'Assistant-01-System',
    prompt: 'Assistant-01-Prompt',
    phaseName: 'Assistant-01-Phase',
  },
  {
    name: 'Assistant-01', // Duplicate name
    role: 'Assistant-02-Role',
    directive: 'Assistant-02-Directive',
    system: 'Assistant-02-System',
    prompt: 'Assistant-02-Prompt',
    phaseName: 'Assistant-02-Phase',
  },
]

export const singleAssistantScenario = {
  assistants: singleAssistant,
  instructions: { query: 'mockQuery' },
}

export const multiAssistantScenario = {
  assistants: multiAssistants,
  instructions: { query: 'mockQuery' },
}

export const preexistingStepsScenario = {
  assistants: [
    {
      name: 'Assistant-XX',
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
      stepId: 'x0001-deploy-assistants',
      stepStatus: 'completed',
      executionOrder: 1,
      llmSystem: 'mockSystem',
      llmPrompt: 'mockPrompt',
      llmResult: 'mockResult',
      assistant: singleAssistant[0],
    },
  ] as WorkflowStep[],
}
