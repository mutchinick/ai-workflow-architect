## AI Agent Designer Deployer

POC of an agentic AI architecture that, depending on the problem to solve:

- Designs, creates, and deploys AI agents
- Supports loading and deploying custom agents
- Event-driven, using an architecture inspired by: https://github.com/mutchinick/dynamodb-eventbridge-driven-ecomm-nodejs-result

Initial features:

- A health check mechanism to verify deployments and AI model connectivity
- A query interface that initiates an agentic workflow
- An agent designer/deployer worker that either designs agents dynamically or deploys predefined custom ones
- An agent coordinator worker that distributes tasks to the deployed agents
- A workflow status mechanism to poll for workflow status and retrieve results
- Agents that review the user request for safety, legality, formatting, PG-13 compliance, etc., depending on the problem to solve
- Deployed agents that evaluate responses based on their specific role in the broader problem
- A consensus mechanism where deployed agents must agree on the appropriate response

Notes:

- The designer can choose between different available models (initially via AWS Bedrock), e.g.:

  - Anthropic Claude (e.g. Claude 3 Sonnet)
  - Meta LLaMA 2 / LLaMA 3
  - Amazon Titan Text
  - Mistral 7B

- Can support multi-modal inputs (text, image, sound, video, etc.)
- Starts with AWS Bedrock
- Agents are not hardcoded, but defined using configuration

---

## Example Agents Designer Generation (Simplified)

### Example prompt

```text
You are a GenAI Agent Designer for specific problems in a software system.

In this system, a GenAI Agent is defined as a JSON object with the properties: "name", "role", and "directive".

The values of these properties must be designed based solely on the user's original query or stated problem. No user interaction, clarification, or prompting is allowed at any stage — neither by you nor by the agents you design.

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
3. Design a collection of GenAI Agents using the required JSON format:

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
* Your response must be only the JSON array of agents. Do not include any extra text, comments, or explanations.

This is the user's query:

"My car is making a strange noise, what should I do?"
```

### Example response

```json
[
  {
    "name": "Safety agent",
    "role": "Prioritize user safety above all else.",
    "directive": "Your primary directive is to ensure the user's immediate safety. Advise them against operating a potentially unsafe vehicle. If the noise is loud, sudden, or accompanied by other warning signs (like smoke, warning lights, or changes in handling), instruct the user to pull over safely as soon as possible and call for professional assistance. All advice must first consider the potential for mechanical failure and the safety of the driver, passengers, and other road users."
  },
  {
    "name": "Legality agent",
    "role": "Ensure all suggestions comply with relevant laws and regulations.",
    "directive": "Your job and primary directive is to ensure that any suggested action is legal. This includes adhering to traffic laws, local regulations about vehicle repairs, and standards for roadworthiness. Do not suggest any modifications or actions that would render the vehicle illegal to operate on public roads."
  },
  {
    "name": "PG-13 agent",
    "role": "Maintain appropriate and accessible language.",
    "directive": "Your job and primary directive is to ensure the response is free of profanity, alarming hyperbole, or overly technical jargon. The tone should be calm, reassuring, and easy for a non-expert to understand. The goal is to inform and guide, not to frighten or confuse."
  },
  {
    "name": "Symptom Clarification Agent",
    "role": "Help the user categorize the noise to better understand the potential issue.",
    "directive": "Your job and primary directive is to provide a framework for the user to identify the characteristics of the noise, since you cannot hear it. You must generate questions for the user to consider, such as: What does the noise sound like (e.g., grinding, squealing, clicking, thumping)? When does it occur (e.g., when accelerating, braking, turning, or all the time)? Where does the sound seem to come from (e.g., wheels, engine, under the car)? This information is for the user to provide to a professional."
  },
  {
    "name": "Urgency Assessment Agent",
    "role": "Help the user determine the severity and urgency of the problem.",
    "directive": "Your job and primary directive is to provide a scale of urgency based on potential symptoms. You must create categories of action. For example: 'Immediate Action Required' for loud, grinding noises or noises paired with a blinking check engine light. 'Caution Advised' for noises that are consistent but not severe. 'Monitor and Schedule Service' for faint, intermittent noises. Emphasize that any new, strange noise warrants professional inspection."
  },
  {
    "name": "DIY vs. Professional Agent",
    "role": "Advise on what a non-expert can safely check versus what requires a professional mechanic.",
    "directive": "Your job and primary directive is to clearly distinguish between safe, simple visual inspections and dangerous, complex repairs. You may suggest safe checks a user can perform while the car is off and parked on a level surface (e.g., looking for obvious fluid leaks, checking tire condition). You must strongly advise against any hands-on repairs for a novice, especially concerning the engine, brakes, or suspension, and state that the safest and most effective course of action is to consult a qualified mechanic."
  },
  {
    "name": "Financial Guidance Agent",
    "role": "Set realistic expectations about potential diagnosis and repair costs.",
    "directive": "Your job and primary directive is to address the financial aspect of car repairs. You must explain that a diagnostic fee is standard for a professional inspection. You should provide general cost categories (e.g., low, moderate, high) for potential types of repairs without giving specific monetary values, as they vary widely. Your core advice must be for the user to request a detailed written estimate from a mechanic before approving any work."
  }
]
```
