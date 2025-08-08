# AI Workflow Architect

This repository contains the code for an experimental, agentic AI architecture. The system is designed to take a user's problem and, instead of answering it directly, first design a dynamic, multi-step workflow of specialized AI assistants to produce a high-quality, comprehensive response.

The core of the project is a "Workflow Architect," a meta-agent that analyzes a user's query and designs a complete execution plan for other "worker" assistants to follow.

---

## Example Workflow Generation

This example shows how the **Workflow Architect** takes a user's query and designs a multi-step plan. The output is a JSON array where each object is a complete set of instructions for a "worker" assistant.

### User Query Example

The user would send a query like this to the system's API:

```text
"I am planning a trip to Rome, Italy. Can you suggest a 5-day itinerary that includes historical sites, local cuisine, and cultural experiences?"
```

### Workflow Architect Prompt

The following `system` and `prompt` are combined and sent to the Workflow Architect LLM. The `system` prompt contains the high-level blueprint and rules, while the `prompt` contains the specific user query for this task.

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
    "role": "Refines the query to ask for a day-by-day structure.",
    "directive": "You are a travel expert. Your job is to refine user queries to ask for a structured, day-by-day itinerary.",
    "system": "You are part of Phase 1: Prompt Enhancement. You are a travel expert. Rewrite the user's query to explicitly ask for a day-by-day itinerary with morning, afternoon, and evening activities. Your response must be ONLY the refined question.",
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

### Example Final Response After the Workflow has completed and all Assistants have participated

```text
**Introduction to Rome Itinerary**

Rome, the Eternal City, is a destination that has been captivating travelers for centuries... This 5-day Rome itinerary is designed to provide a comprehensive and unforgettable experience, balancing iconic landmarks, cultural immersion, and leisure activities...

**Overview of 5-Day Trip**

This 5-day itinerary is carefully crafted to ensure that travelers experience the best of Rome, from its ancient ruins and Vatican City to its charming neighborhoods and culinary delights...

...

**Day 1: Ancient Rome and Local Cuisine**

The first day of the itinerary is dedicated to exploring Ancient Rome... The morning begins with a visit to the **Colosseum and Roman Forum**... In the afternoon, travelers can explore the **Pantheon**... The evening is reserved for a delicious dinner at **Trattoria al Moro**...

**Day 2: Vatican City and Cultural Experiences**

The second day of the itinerary is focused on Vatican City... The morning begins with a **guided Vatican City tour**, including visits to the **Sistine Chapel** and **St. Peter's Basilica**...

...

**(Content for Day 3, 4, and 5 is abridged)**

...

**Budgeting and Recommendations**

To make the most of this 5-day Rome itinerary, travelers should consider the following budgeting and planning recommendations:

- **Accommodation options in the city center**...
- **Affordable transportation choices**...
- **Guided tours and budget-friendly activities**...

**Conclusion**

This 5-day Rome itinerary offers a comprehensive and unforgettable experience... By prioritizing must-see attractions and experiences, travelers can enjoy a well-rounded and memorable trip to Rome without overspending...

...

**(Additional sections on Critical Review, Recommendations, Hidden Gems, Food, Accommodation, Transportation, Sustainable Tourism, and Personalized Recommendations are abridged)**

...

By following these tips and recommendations, travelers can have a fantastic and unforgettable experience in Rome, even on a moderate budget. Buon viaggio!
```

---

## Core Concepts & Architecture

The system uses an asynchronous, event-driven architecture to manage the lifecycle of a workflow. This design is inspired by the patterns found in the [dynamodb-eventbridge-driven-ecomm-nodejs-result](https://github.com/mutchinick/dynamodb-eventbridge-driven-ecomm-nodejs-result) repository, which allows for a decoupled and scalable orchestration of complex processes.

The main components are:

- **WorkflowArchitect:** The "meta-assistant" or strategist LLM responsible for analyzing the user's query and designing the entire multi-step execution plan.

- **Workflow:** The core domain object that represents the state of the entire process.

  - **WorkflowStep:** Represents a single, executable step within the workflow.

- **InvokeBedrockClient:** A robust client for making calls to the Amazon Bedrock LLM.

- **SaveWorkflowClient, ReadWorkflowClient, ReadLatestWorkflowClient:** Clients for persisting and retrieving workflow state from S3.

- **EventStoreClient:** A client for saving events to the event store (DynamoDB).

- **EventStoreEvent:** The base class for all events in the system.

  - `WorkflowCreatedEvent`: Fired when a new workflow is initiated.
  - `WorkflowAssistantsDeployedEvent`: Fired after the architect has designed the workflow.
  - `WorkflowStepProcessedEvent`: Fired after each individual assistant step is completed.
  - `WorkflowCompletedEvent`: Fired when the entire workflow is finished.

- **SendQueryApi:** An API endpoint that receives the user's query, initiates the process, and emits an event to start the workflow.

- **GetLatestWorkflowApi:** An API to query the workflow progress and retrieve the latest results.

- **DeployWorkflowAssistantsWorker:** This worker listens for the initial event and calls the "Workflow Architect" LLM to design the JSON-based execution plan. Once the plan is designed, it saves it and emits a `WorkflowDeployedEvent`.

- **ProcessWorkflowStepWorker:** This is the core execution engine. It listens for `WorkflowDeployedEvent` and subsequent `WorkflowStepProcessedEvent` messages. For each step, it executes the assistant's prompt and saves the state, emitting events to continue the process until a `WorkflowCompletedEvent` is produced.

- **WorkflowPhase:** The architect's design process is guided by a multi-phase blueprint to ensure every generated workflow is consistent and robust, covering prompt enhancement, outline generation, content creation, critical review, and final unification.
