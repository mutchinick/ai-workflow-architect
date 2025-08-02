import { Agent } from './Agent'

export type WorkflowPhase = {
  name: string
  goal: string
  agentRange: {
    min: number
    max: number
  }
  responseRules: string
}

export const WORKFLOW_PHASES: Record<string, WorkflowPhase> = {
  PROMPT_ENHANCEMENT: {
    name: 'Phase 1: Prompt Enhancement',
    goal: 'To refine and enrich the user initial question. Agents in this phase REWRITE the question to add detail, scope, and clarity.',
    agentRange: { min: 5, max: 8 },
    responseRules: `
      Your final output MUST be only the refined question.
      You must not answer the question.
      Do not include any other text, comments, or explanations.
    `.trim(),
  },
  FIRST_RESPONSE: {
    name: 'Phase 2: First Response',
    goal: 'To provide the initial, core answer to the fully enhanced prompt from the previous phase.',
    agentRange: { min: 1, max: 1 },
    responseRules: `
      Your response must be a direct and professional answer to the question.
      Do not include conversational filler, commentary, or emojis.
    `.trim(),
  },
  CONTEXTUAL_EXPANSION: {
    name: 'Phase 3: Contextual Expansion',
    goal: 'To add new layers of information and different perspectives to the result.',
    agentRange: { min: 10, max: 15 },
    responseRules: `
      Your final output MUST be the complete, original text immediately followed by your new, appended content.
      You are forbidden from returning only the new content.
      You must not modify the existing text; you can only append new content.
      You must not remove any of the content provided to you.
    `.trim(),
  },
  RESULT_ORGANIZATION: {
    name: 'Phase 4: Result Organization',
    goal: 'Organize all previously generated content into a single, cohesive, and well-structured document, using sections or chapters.',
    agentRange: { min: 4, max: 6 },
    responseRules: `
      Your final output MUST be the complete, rewritten, and organized text.
      Your final output MUST not remove any of the content provided to you.
    `.trim(),
  },
  // COMPLIANCE_REVIEW: {
  //   name: 'Phase 5: Compliance Review',
  //   goal: 'To ensure the final output is safe and appropriate by reviewing it for Legal, PG-13, and Harmful Content compliance. This phase MUST conclude the workflow with three agents, in this order: Legal, PG-13, and Harmful Content.',
  //   agentRange: { min: 3, max: 3 },
  //   responseRules: `
  //     Your final output MUST be the complete, rewritten text, ensuring it complies with your directive.
  //   `.trim(),
  // },
}

const buildBlueprintText = (): string => {
  return Object.values(WORKFLOW_PHASES)
    .map((phase) => {
      const agentRangeText =
        phase.agentRange.min === phase.agentRange.max
          ? `${phase.agentRange.min} (fixed)`
          : `${phase.agentRange.min} (minimum) to ${phase.agentRange.max} (maximum)`

      return `### ${phase.name}\n- **Agent Range:** ${agentRangeText}\n- **Goal:** ${phase.goal}`
    })
    .join('\n\n')
}

/**
 *
 */
export const AgentsDesignerAgent: Agent = {
  name: 'Workflow Architect Agent',
  role: "Designs a complete, sequential workflow of GenAI agents based on a user's question.",
  directive: `You are a GenAI Workflow Architect. Your job is to analyze a user's problem and design a complete, step-by-step execution plan as a JSON array of Agent Steps.`,

  system: `
      You are a GenAI Workflow Architect, a master strategist in designing AI-driven solutions. Your primary goal is to create the most effective sequence of steps to produce a high-quality answer to a user's question.

      ## Core Task
      You will generate a plan as a JSON array of "Agent Steps". Each step is a self-contained task for a worker AI, complete with its own detailed instructions.

      ## Workflow Construction Blueprint
      For every user question, you MUST construct the workflow following this exact, phased blueprint. Your task is to analyze the user's question and design agents that are experts in their field and achieve the **Goal** for each phase.

      ${buildBlueprintText()}

      ## Agent Step Definition (The JSON Structure You Must Create)
      - "name": A descriptive name for the agent performing the step (e.g., "Scientific Accuracy Agent 1 of 5").
      - "role": A one-sentence description of the agent's purpose.
      - "directive": The detailed instructions for the agent.
      - "system": The specific, comprehensive system prompt for this step's LLM call.
      - "prompt": The specific user prompt for this step's LLM call.
      - "phaseName": The exact name of the workflow phase this agent belongs to (e.g., "Phase 1: Prompt Enhancement").

      ## **CRITICAL RULE: The Quality of Your Design**
      For each Agent Step, you MUST create a comprehensive 'system' prompt that defines the worker agent's persona and expertise. This 'system' prompt MUST state the name of the workflow phase it belongs to and include the agent's full directive.

      ## Placeholder Rules for Prompts
      - The 'prompt' for the VERY FIRST step must use the original user question.
      - The 'prompt' for EVERY SUBSEQUENT step MUST contain "<PREVIOUS_RESULT>".

      ## Your Final Output
      - Your final response MUST BE ONLY the raw JSON array of Agent Steps, starting with \`[\` and ending with \`]\`.
      `,

  prompt: `Design the complete agent workflow for the following user question:\n<question>{{USER_QUESTION}}</question>`,

  phaseName: 'Phase X: Architect Workflow',
}
