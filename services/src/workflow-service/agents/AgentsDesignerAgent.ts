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
    goal: 'To refine the user initial question into a detailed, actionable prompt.',
    agentRange: { min: 3, max: 5 },
    responseRules: `
      Your final output MUST be only the refined question.
      You must not answer the question.
    `.trim(),
  },
  OUTLINE_GENERATION: {
    name: 'Phase 2: Outline Generation',
    goal: 'To create a comprehensive, well-structured outline or table of contents for the final document. This outline will serve as the blueprint for the next phase.',
    agentRange: { min: 1, max: 1 },
    responseRules: `
      Your output MUST be ONLY a detailed, well-structured outline (e.g., using Markdown headings).
      Do not write the content for the sections, only the structure.
    `.trim(),
  },
  CONTENT_GENERATION: {
    name: 'Phase 3: Content Generation',
    goal: 'To write the detailed, high-quality content for each section of the provided outline. This forms the main body of the final document.',
    agentRange: { min: 1, max: 1 },
    responseRules: `
      Your output MUST be the full, well-written text of the document, following the structure of the outline provided in <PREVIOUS_RESULT>.
      Your response must be a direct and professional answer.
    `.trim(),
  },
  CRITICAL_REVIEW_AND_DEEPENING: {
    name: 'Phase 4: Critical Review and Deepening',
    goal: 'To critically review the generated content, identify shallow or weak points, and add significant depth, practical examples, code snippets, and expert-level detail.',
    agentRange: { min: 10, max: 15 },
    responseRules: `
      Your final output MUST be the complete, original text immediately followed by your new, appended content.
      You are forbidden from returning only the new content.
      You must not modify the existing text; you can only append new, high-value content.
    `.trim(),
  },
  FINAL_UNIFICATION: {
    name: 'Phase 5: Final Unification & Polish',
    goal: 'To rewrite the entire document, seamlessly integrating all the added depth and critiques from the previous phase into a final, polished, and professional-grade guide.',
    agentRange: { min: 2, max: 4 },
    responseRules: `
      Your final output MUST be the complete, rewritten, and unified text.
      You must preserve all the detailed information and examples added in the previous step, integrating them smoothly.
    `.trim(),
  },
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
      - "system": The specific, comprehensive system prompt for this step's LLM call. This prompt MUST NOT contain the "<PREVIOUS_RESULT>" placeholder.
      - "prompt": The specific user prompt for this step's LLM call. The prompt for the first step uses the original query. Every subsequent prompt MUST contain the placeholder string "<PREVIOUS_RESULT>".
      - "phaseName": The exact name of the workflow phase this agent belongs to (e.g., "Phase 1: Prompt Enhancement").

      ## **CRITICAL RULE: The Quality of Your Design**
      For each Agent Step, you MUST create a comprehensive 'system' prompt that defines the worker agent's persona and expertise. This 'system' prompt MUST state the name of the workflow phase it belongs to and include the agent's full directive.

      ## Your Final Output
      - Your final response MUST BE ONLY the raw JSON array of Agent Steps, starting with \`[\` and ending with \`]\`.
      `,

  prompt: `Design the complete agent workflow for the following user question:\n<question>{{USER_QUESTION}}</question>`,

  phaseName: 'Phase X: Architect Workflow',
}
