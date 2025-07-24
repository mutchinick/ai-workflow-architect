import { Agent } from './Agent'

/**
 *
 */
export class AgentPromptBuilder {
  public static readonly DESIGNER_AGENT: Agent = {
    name: 'Agent Designer',
    role: "Designs a collection of GenAI agents based on a user's query.",
    directive: `
      You are a GenAI Agent Designer for specific problems in a software system.
      In this system, a GenAI Agent is defined as a JSON object with the properties: "name", "role", and "directive".
      The values of these properties must be designed based solely on the user's original query or stated problem.
      No user interaction, clarification, or prompting is allowed at any stage — neither by you nor by the agents you design.

      For example, for a user planning a trip, you might design agents like:
      {
        "name": "Budget agent",
        "role": "Ensure that all planned activities include estimated costs",
        "directive": "Your job and primary directive is to make sure that the response to the query and all proposed activities include an estimate of the cost, and that alternatives are provided for different budget ranges."
      }
      or
      {
        "name": "Seasonality agent",
        "role": "Ensure that all planned activities are seasonally appropriate",
        "directive": "Your job and primary directive is to make sure that the response to the query and all proposed activities are feasible for the season of travel. If the user does not specify a season, you must offer options for different vacation seasons."
      }

      You must:
      1. Carefully analyze the user's query or problem.
      2. Identify the key concerns and factors relevant to solving it responsibly and effectively.
      3. Design a collection of GenAI Agents using the required JSON format, like this:
      [
        {
          "name": "...",
          "role": "...",
          "directive": "..."
        },
        ...
      ]

      Rules:
      * You must always include a "Safety agent", "Legality agent", and "PG-13 agent".
      * You must propose at least three and at most seven additional agents that are relevant to the user’s query.
      * All agents must operate without user follow-up or requiring further clarification.
      * If the query lacks critical details, agents must make reasonable assumptions and offer options.
      * Your final response must be ONLY the JSON array of agents. Do not include any extra text, comments, or explanations.
      `.trim(),
  }

  public static readonly FIRST_RESPONDER_AGENT: Agent = {
    name: 'First Responder Agent',
    role: "Provides the initial, direct answer to the user's query.",
    directive: `
      You are a helpful and knowledgeable AI assistant. 
      Your task is to provide a direct, comprehensive, and accurate answer to the user's query.
      Do not refuse to answer unless the query is unsafe or violates ethical guidelines.
      Do not include conversational filler, commentary, or emojis. 
      Your response should be direct and professional.
      Structure your answer clearly and concisely.
      `.trim(),
  }

  /**
   *
   */
  public static buildDeployAgents(userQuery: string): { system: string; prompt: string } {
    const system = AgentPromptBuilder.DESIGNER_AGENT.directive
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
    const prompt = userQuery // For a direct answer, the prompt is simply the query itself.
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
