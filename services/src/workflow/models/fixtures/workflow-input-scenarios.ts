import { WorkflowInput } from '../Workflow'

export const workflowInputScenarios: { name: string; input: WorkflowInput }[] = [
  {
    name: 'Scenario 1: Standard Valid Input',
    input: {
      query: 'Create a comprehensive business plan for a new coffee shop.',
      enhancePromptRounds: 3,
      enhanceResultRounds: 2,
    },
  },
  {
    name: 'Scenario 2: Minimum Valid Rounds',
    input: {
      query: 'Outline the key sections of a user manual.',
      enhancePromptRounds: 1,
      enhanceResultRounds: 1,
    },
  },
  {
    name: 'Scenario 3: Maximum Valid Rounds',
    input: {
      query: 'Generate a detailed report on climate change impacts.',
      enhancePromptRounds: 10,
      enhanceResultRounds: 10,
    },
  },
  {
    name: 'Scenario 4: Invalid Input - Short Query (for validation testing)',
    input: {
      query: 'Short',
      enhancePromptRounds: 1,
      enhanceResultRounds: 1,
    },
  },
  {
    name: 'Scenario 5: Invalid Input - Zero Rounds (for validation testing)',
    input: {
      query: 'A valid query for testing zero rounds.',
      enhancePromptRounds: 0,
      enhanceResultRounds: 1,
    },
  },
  {
    name: 'Scenario 6: Invalid Input - Rounds Exceed Max (for validation testing)',
    input: {
      query: 'A valid query for testing max rounds.',
      enhancePromptRounds: 11,
      enhanceResultRounds: 5,
    },
  },
]
