import { WorkflowInstructions } from '../Workflow'

export const standardValidInstructions: { instructions: WorkflowInstructions } = {
  instructions: {
    query: 'Create a comprehensive business plan for a new coffee shop.',
    enhancePromptRounds: 3,
    enhanceResultRounds: 2,
  },
}

export const minRoundsInstructions: { instructions: WorkflowInstructions } = {
  instructions: {
    query: 'Outline the key sections of a user manual.',
    enhancePromptRounds: 1,
    enhanceResultRounds: 1,
  },
}

export const maxRoundsInstructions: { instructions: WorkflowInstructions } = {
  instructions: {
    query: 'Generate a detailed report on climate change impacts.',
    enhancePromptRounds: 10,
    enhanceResultRounds: 10,
  },
}

export const shortQueryInstructions: { instructions: WorkflowInstructions } = {
  instructions: {
    query: 'Short',
    enhancePromptRounds: 1,
    enhanceResultRounds: 1,
  },
}

export const zeroRoundsInstructions: { instructions: WorkflowInstructions } = {
  instructions: {
    query: 'A valid query for testing zero rounds.',
    enhancePromptRounds: 0,
    enhanceResultRounds: 1,
  },
}

export const maxRoundsExceededInstructions: { instructions: WorkflowInstructions } = {
  instructions: {
    query: 'A valid query for testing max rounds.',
    enhancePromptRounds: 11,
    enhanceResultRounds: 5,
  },
}
