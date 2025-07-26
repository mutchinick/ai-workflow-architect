import { Agent } from './Agent'

/**
 *
 */
export class AgentPromptBuilder {
  /**
   *
   */
  public static buildDeployAgents(agent: Agent, userQuery: string): { system: string; prompt: string } {
    const system = agent.directive
    const prompt = `
      Design the GenAI agents for the following user query:
      <query>${userQuery}</query>`.trim()
    return { system, prompt }
  }

  /**
   *
   */
  public static buildFirstResponder(agent: Agent, userQuery: string): { system: string; prompt: string } {
    const system = agent.directive
    const prompt = userQuery
    return { system, prompt }
  }

  /**
   *
   */
  public static buildEnhancePrompt(agent: Agent, userQuery: string): { system: string; prompt: string } {
    const system = `
      You are an AI assistant acting as a query refiner. 
      Your goal is to rewrite a user's query to be more specific, detailed, and effective, based on a primary directive.

      Your primary directive is: "${agent.directive}"

      You must analyze the user's original query and rewrite it to incorporate the focus of your directive. 
      The new query should be a single, self-contained question or instruction that an AI could answer effectively.

      Rules:
      - Your response must be ONLY the refined query string.
      - Do not include any extra text, comments, explanations, or quotation marks.
      - Do not answer the query; your only job is to improve it.
      `.trim()

    const prompt = `
      Based on your directive, refine the following user query:
      <original_query>${userQuery}</original_query>
      `.trim()

    return { system, prompt }
  }

  /**
   *
   */
  public static buildEnhanceResult(agent: Agent, llmResponse: string): { system: string; prompt: string } {
    const system = `
      You are an AI assistant acting as a result enhancer. 
      Your goal is to rewrite or add to an existing text to make it better, based on a primary directive.

      Your primary directive is: "${agent.directive}"

      You must analyze the original text and rewrite it to incorporate the focus of your directive. 
      The new text should be a complete and coherent response.

      Rules:
      - Your response must be ONLY the refined text.
      - Do not include any extra text, comments, or explanations like "Here is the refined result:".
      - Your job is to improve the existing text, not to start from scratch.
      `.trim()

    const prompt = `
      Based on your directive, enhance the following text:
      <original_result>${llmResponse}</original_result>
      `.trim()

    return { system, prompt }
  }
}
