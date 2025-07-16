import { Agent } from '../Agent'

export const agentScenarios: { name: string; agents: Agent[] }[] = [
  {
    name: 'Scenario 1: Single Agent',
    agents: [
      {
        name: 'Copernicus',
        role: 'Primary Researcher',
        directive: 'Analyze the initial query and provide a foundational answer.',
      },
    ],
  },
  {
    name: 'Scenario 2: Multiple Agents',
    agents: [
      {
        name: 'Architect',
        role: 'Solution Designer',
        directive: 'Design the high-level structure of the response.',
      },
      {
        name: 'Critic',
        role: 'Quality Assurance',
        directive: 'Review the proposed solution for flaws and suggest improvements.',
      },
      {
        name: 'Writer',
        role: 'Content Creator',
        directive: 'Compose the final, well-structured response based on the architecture and critiques.',
      },
    ],
  },
  {
    name: 'Scenario 3: Empty Agent Array (Edge Case)',
    agents: [],
  },
  {
    name: 'Scenario 4: Agents with Duplicate Names (Integrity Test)',
    agents: [
      {
        name: 'Validator',
        role: 'Reviewer of something',
        directive: 'Review the work. Test case agent.',
      },
      {
        name: 'Validator',
        role: 'Reviewer of something',
        directive: 'Review the work. Test case agent.',
      },
    ],
  },
  {
    name: 'Scenario 5: Agents with Special Characters in Name (Sanitization Test)',
    agents: [
      {
        name: 'Agent (X/Y)',
        role: 'Specialist Agent',
        directive: 'Test some agent to handle complex cases.',
      },
    ],
  },
]
