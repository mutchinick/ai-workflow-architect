# AI Workflow Architect

This repository contains the code for an experimental AI architecture. The system is designed to take a user's question and, instead of answering it directly, first design a dynamic, multi-step workflow of specialized AI assistants to produce a high-quality, comprehensive response.

The core of the project is a "Workflow Architect," a meta-assistant that analyzes a user's question and designs a complete execution plan for other "worker" assistants to follow.

---

## Example Workflow Generation

This example shows how the **Workflow Architect** takes a user's question and designs a multi-step plan. The output is a JSON array where each object is a complete set of instructions for a "worker" assistant.

### User Question Example

The user would send a question like this to the system's API:

```text
"I am planning a trip to Rome, Italy. Can you suggest a 5-day itinerary that includes historical sites, local cuisine, and cultural experiences?"
```

### Workflow Architect Prompt

The following `system` and `prompt` are combined and sent to the Workflow Architect LLM. The `system` prompt contains the high-level blueprint and rules, while the `prompt` contains the specific user question for this task.

#### System Prompt

```text
You are a GenAI Workflow Architect, a master strategist in designing AI-driven solutions. Your primary goal is to create the most effective sequence of steps to produce a high-quality answer to a user's question.

## Core Task

You will generate a plan as a JSON array of "Assistant Steps". Each step is a self-contained task for a worker AI, complete with its own detailed instructions.

## Workflow Construction Blueprint

For every user question, you MUST construct the workflow following this exact, phased blueprint. Your task is to analyze the user's question and design assistants that are experts in their field and achieve the **Goal** for each phase.

### Phase 1: Prompt Enhancement
- **Assistant Range:** 3 (minimum) to 5 (maximum)
- **Goal:** To refine the user initial question into a detailed, actionable prompt.

### Phase 2: Outline Generation
- **Assistant Range:** 1 (fixed)
- **Goal:** To create a comprehensive, well-structured outline or table of contents for the final document. This outline will serve as the blueprint for the next phase.

### Phase 3: Content Generation
- **Assistant Range:** 1 (fixed)
- **Goal:** To write the detailed, high-quality content for each section of the provided outline. This forms the main body of the final document.

### Phase 4: Critical Review and Deepening
- **Assistant Range:** 10 (minimum) to 15 (maximum)
- **Goal:** To critically review the generated content, identify shallow or weak points, and add significant depth, practical examples, code snippets, and expert-level detail.

### Phase 5: Final Unification & Polish
- **Assistant Range:** 2 (minimum) to 4 (maximum)
- **Goal:** To rewrite the entire document, seamlessly integrating all the added depth and critiques from the previous phase into a final, polished, and professional-grade guide.

## Assistant Step Definition (The JSON Structure You Must Create)

- "name": A descriptive name for the assistant performing the step (e.g., "Scientific Accuracy Assistant 1 of 5").
- "role": A one-sentence description of the assistant's purpose.
- "directive": The detailed instructions for the assistant.
- "system": The specific, comprehensive system prompt for this step's LLM call. This prompt MUST NOT contain the "<PREVIOUS_RESULT>" placeholder.
- "prompt": The specific user prompt for this step's LLM call. The prompt for the first step uses the original query. Every subsequent prompt MUST contain the placeholder string "<PREVIOUS_RESULT>".
- "phaseName": The exact name of the workflow phase this assistant belongs to (e.g., "Phase 1: Prompt Enhancement").

## **CRITICAL RULE: The Quality of Your Design**

For each Assistant Step, you MUST create a comprehensive 'system' prompt that defines the worker assistant's persona and expertise. This 'system' prompt MUST state the name of the workflow phase it belongs to and include the assistant's full directive.

## Your Final Output

- Your final response MUST BE ONLY the raw JSON array of Assistant Steps, starting with `[` and ending with `]`.
```

#### Prompt

```text
Design the complete assistant workflow for the following user question:
<query>I am planning a trip to Rome, Italy. Can you suggest a 5-day itinerary that includes historical sites, local cuisine, and cultural experiences?</query>
```

### Example Architect Response (Abridged for Readability)

This is an example of the kind of JSON the architect would produce. The full response would contain many more steps, following the blueprint.

```json
[
  {
    "name": "Itinerary Structure Assistant (Prompt Enhancer)",
    "role": "Refines the question to ask for a day-by-day structure.",
    "directive": "You are a travel expert. Your job is to refine user questions to ask for a structured, day-by-day itinerary.",
    "system": "You are part of Phase 1: Prompt Enhancement. You are a travel expert. Rewrite the user's question to explicitly ask for a day-by-day itinerary with morning, afternoon, and evening activities. Your response must be ONLY the refined question.",
    "prompt": "I am planning a trip to Rome, Italy. Can you suggest a 5-day itinerary that includes historical sites, local cuisine, and cultural experiences?",
    "phaseName": "Phase 1: Prompt Enhancement"
  },
  {
    "name": "Outline Generation Assistant",
    "role": "Creates a structured outline for the 5-day itinerary.",
    "directive": "You are a travel guide author. Your job is to create a logical outline for a 5-day Rome itinerary.",
    "system": "You are part of Phase 2: Outline Generation. You are a travel guide author. Your task is to create a detailed outline for a 5-day Rome itinerary. The outline should have a heading for each day. Your output MUST be ONLY a detailed, well-structured outline.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 2: Outline Generation"
  },
  {
    "name": "Content Generation Assistant",
    "role": "Writes the main content for the itinerary based on the outline.",
    "directive": "You are an experienced travel writer. Your job is to write a clear, engaging itinerary based on the provided outline.",
    "system": "You are part of Phase 3: Content Generation. You are an experienced travel writer. Your task is to write the full content for the itinerary, following the structure of the outline provided in <PREVIOUS_RESULT>. Your response must be a direct and professional answer.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 3: Content Generation"
  }
]
```

---

The JSON array produced by the architect is used to build a `Workflow` object. This workflow is then executed by the `ProcessWorkflowStepWorker`, which processes each assistant step in sequence. For each step, the worker reads the result from the previous step, enhances it according to the current assistant's `system` and `prompt` instructions, and saves the new state to an S3 bucket. This cycle continues until the final, comprehensive response is produced and stored.

---

### Example Final Response (Abridged)

After the full workflow has been executed by all the assistants, the final output is a comprehensive, multi-section guide.

```text
**A Comprehensive 5-Day Itinerary for Rome**

**Introduction**
Rome, the Eternal City, is a destination that captivates travelers with its rich history, stunning architecture, and delectable cuisine. This 5-day itinerary is designed to provide an unforgettable experience, balancing iconic landmarks with authentic cultural immersion.

...

**Day 1: Echoes of Ancient Rome**
The first day is dedicated to exploring the heart of the ancient world. The morning begins with a visit to the **Colosseum and Roman Forum**, where you can walk through the ruins and gain a deeper understanding of the city's history. In the afternoon, explore the **Pantheon** and the charming streets of the historic center.

...

**(Content for Days 2, 3, 4, and 5, as well as sections on Budgeting, Recommendations, Hidden Gems, and more, are abridged)**

...

By following these tips, travelers can have a fantastic and unforgettable experience in Rome. Buon viaggio!
```

---

## Core Concepts & Architecture

The system uses an asynchronous, event-driven architecture to manage the lifecycle of a workflow. This design is inspired by the patterns found in the [dynamodb-eventbridge-driven-ecomm-nodejs-result](https://github.com/mutchinick/dynamodb-eventbridge-driven-ecomm-nodejs-result) repository.

The main components are:

- **WorkflowArchitect:** The definition for the strategist "meta-assistant." Its `system` prompt instructs an LLM to analyze the user's question and design the entire multi-step execution plan.

- **Workflow:** The core domain object that represents the state of the entire process, including the sequence of steps to be executed.

- **WorkflowPhase:** The architect's design process is guided by a multi-phase blueprint to ensure every generated workflow is consistent and robust.

- **SendQueryApi:** An API endpoint that receives the user's question and initiates the workflow.

- **DeployWorkflowAssistantsWorker:** A worker that calls the Workflow Architect to design the execution plan and emits a `WorkflowDeployedEvent`.

- **ProcessWorkflowStepWorker:** The core execution engine that processes each assistant step in the workflow.

## Technology Stack

- **Language:** TypeScript
- **AI/LLM:** Amazon Bedrock
- **AI SDK:** Vercel AI SDK
- **Infrastructure as Code:** AWS CDK
- **Testing:** Jest
