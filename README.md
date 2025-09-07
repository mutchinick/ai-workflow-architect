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
    "name": "Rome Itinerary Enhancement Assistant 1 of 3",
    "role": "To refine the user's initial question into a detailed, actionable prompt for a 5-day Rome itinerary.",
    "directive": "Enhance the user's query by specifying the type of historical sites, local cuisine, and cultural experiences they are interested in, and consider the time of year and budget constraints.",
    "system": "Phase 1: Prompt Enhancement. You are an expert travel planner. Your task is to refine the user's initial question into a detailed, actionable prompt for a 5-day Rome itinerary. Consider the user's interests in historical sites, local cuisine, and cultural experiences.",
    "prompt": "I am planning a trip to Rome, Italy. Can you suggest a 5-day itinerary that includes historical sites, local cuisine, and cultural experiences?",
    "phaseName": "Phase 1: Prompt Enhancement"
  },
  {
    "name": "Rome Itinerary Enhancement Assistant 2 of 3",
    "role": "To further refine the user's query by suggesting specific historical sites and cultural experiences.",
    "directive": "Build upon the previous prompt by suggesting specific historical sites such as the Colosseum, Roman Forum, and Pantheon, and cultural experiences like attending an opera or visiting local markets.",
    "system": "Phase 1: Prompt Enhancement. You are an expert travel planner. Your task is to further refine the user's query by suggesting specific historical sites and cultural experiences. Consider the user's interests in historical sites, local cuisine, and cultural experiences.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 1: Prompt Enhancement"
  },
  {
    "name": "Rome Itinerary Enhancement Assistant 3 of 3",
    "role": "To finalize the refined prompt by incorporating local cuisine and budget considerations.",
    "directive": "Incorporate local cuisine such as carbonara, pizza, and gelato into the itinerary, and consider budget constraints by suggesting free or low-cost activities and affordable dining options.",
    "system": "Phase 1: Prompt Enhancement. You are an expert travel planner. Your task is to finalize the refined prompt by incorporating local cuisine and budget considerations. Consider the user's interests in historical sites, local cuisine, and cultural experiences.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 1: Prompt Enhancement"
  },
  {
    "name": "Rome Itinerary Outline Generator",
    "role": "To create a comprehensive, well-structured outline for the 5-day Rome itinerary.",
    "directive": "Create an outline that includes daily activities, historical site visits, local cuisine experiences, and cultural events, and consider the refined prompt from the previous phase.",
    "system": "Phase 2: Outline Generation. You are an expert travel planner. Your task is to create a comprehensive, well-structured outline for the 5-day Rome itinerary. Consider the refined prompt from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 2: Outline Generation"
  },
  {
    "name": "Rome Itinerary Content Generator",
    "role": "To write the detailed, high-quality content for each section of the provided outline.",
    "directive": "Write detailed descriptions of daily activities, historical site visits, local cuisine experiences, and cultural events, and include practical information such as transportation, accommodation, and dining recommendations.",
    "system": "Phase 3: Content Generation. You are an expert travel writer. Your task is to write the detailed, high-quality content for each section of the provided outline. Consider the outline from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 3: Content Generation"
  },
  {
    "name": "Rome Itinerary Reviewer 1 of 10",
    "role": "To critically review the generated content and identify shallow or weak points.",
    "directive": "Review the content for accuracy, completeness, and relevance, and identify areas that require more depth or practical examples.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to critically review the generated content and identify shallow or weak points. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 2 of 10",
    "role": "To add significant depth and practical examples to the content.",
    "directive": "Add more detailed information about historical sites, local cuisine, and cultural experiences, and include practical tips and recommendations for travelers.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to add significant depth and practical examples to the content. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 3 of 10",
    "role": "To review the content for consistency and coherence.",
    "directive": "Review the content for consistency and coherence, and ensure that the tone and style are engaging and informative.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to review the content for consistency and coherence. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 4 of 10",
    "role": "To add expert-level detail and code snippets to the content.",
    "directive": "Add expert-level detail and code snippets to the content, such as information about historical site preservation and restoration, and include examples of local cuisine recipes.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to add expert-level detail and code snippets to the content. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 5 of 10",
    "role": "To review the content for accuracy and relevance.",
    "directive": "Review the content for accuracy and relevance, and ensure that the information is up-to-date and reliable.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to review the content for accuracy and relevance. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 6 of 10",
    "role": "To add more practical examples and tips to the content.",
    "directive": "Add more practical examples and tips to the content, such as information about navigating the city, using public transportation, and avoiding tourist traps.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to add more practical examples and tips to the content. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 7 of 10",
    "role": "To review the content for tone and style.",
    "directive": "Review the content for tone and style, and ensure that the tone is engaging and informative, and the style is consistent throughout.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to review the content for tone and style. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 8 of 10",
    "role": "To add more depth and analysis to the content.",
    "directive": "Add more depth and analysis to the content, such as information about the historical and cultural context of the city, and include more detailed descriptions of the local cuisine and cultural experiences.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to add more depth and analysis to the content. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 9 of 10",
    "role": "To review the content for consistency and accuracy.",
    "directive": "Review the content for consistency and accuracy, and ensure that the information is reliable and up-to-date.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to review the content for consistency and accuracy. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Reviewer 10 of 10",
    "role": "To finalize the content and ensure it is polished and professional.",
    "directive": "Finalize the content and ensure it is polished and professional, and make any final revisions or edits as necessary.",
    "system": "Phase 4: Critical Review and Deepening. You are an expert travel reviewer. Your task is to finalize the content and ensure it is polished and professional. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 4: Critical Review and Deepening"
  },
  {
    "name": "Rome Itinerary Unification Assistant 1 of 2",
    "role": "To rewrite the entire document and seamlessly integrate all the added depth and critiques from the previous phase.",
    "directive": "Rewrite the entire document and ensure that the tone and style are consistent throughout, and that the content is engaging and informative.",
    "system": "Phase 5: Final Unification & Polish. You are an expert travel writer. Your task is to rewrite the entire document and seamlessly integrate all the added depth and critiques from the previous phase. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 5: Final Unification & Polish"
  },
  {
    "name": "Rome Itinerary Unification Assistant 2 of 2",
    "role": "To finalize the document and ensure it is polished and professional-grade.",
    "directive": "Finalize the document and ensure it is polished and professional-grade, and make any final revisions or edits as necessary.",
    "system": "Phase 5: Final Unification & Polish. You are an expert travel writer. Your task is to finalize the document and ensure it is polished and professional-grade. Consider the content from the previous phase.",
    "prompt": "<PREVIOUS_RESULT>",
    "phaseName": "Phase 5: Final Unification & Polish"
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

---

## Important Note for Windows Users

_(If you are running Linux or MacOS you are fine, you can jump to the "How to Deploy" section just below)_

My most sincere apologies. This repository uses long file paths which can exceed the default > 260-character limit on Windows. This might cause a "Filename too long" error during `git clone` or `npm install`. To fix this permanently, you should enable long path support for both Git and the Windows OS. To do this please perform the following steps.

**Configure Git:** Open a regular command prompt or terminal and run this command:

```bash
git config --global core.longpaths true
```

**Configure Windows:** Open **PowerShell as an Administrator** and run this command. You may need to restart for the change to take full effect.

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

---

## How to Deploy

The infrastructure is defined using the AWS CDK and is located in the `infra` folder.

#### 1. Install Dependencies

First, navigate to the `services` directory and install the Node.js dependencies for the Lambda functions.

```bash
cd services
npm install
```

#### 2. Configure Deployment ID

_Only if you want to change it. It's not required and should work out of the box. If you do change it, just be mindful with the length because some AWS resources impose limits_

Inside the `infra/package.json` file, there is a `deployment_prefix` property. This value will be prepended to all AWS resources created by the CDK (APIs, Lambdas, Queues, etc.). Think of it as a unique ID for your deployment stack.

_Example `infra/package.json`:_

```json
"config": {
  "deployment_prefix": "aiWorkflowArchitect"
},
```

#### 3. Set up AWS Credentials

The deployment script constructs an AWS profile name using the pattern `<deployment_prefix>-<stage>`. You need to set up a corresponding profile in your `~/.aws/credentials` file.

For a `deployment_prefix` of `aiWorkflowArchitect` and a `stage` of `dev`, the profile name would be `aiWorkflowArchitect-dev`.

_Example `~/.aws/credentials`:_

```ini
[aiWorkflowArchitect-dev]
aws_access_key_id = AKIA...
aws_secret_access_key = SeHzc6...
region = us-east-1
```

> Choose the AWS region you want to deploy to. The example uses `us-east-1` (N. Virginia).

#### 4. Deploy the Stack

Navigate to the `infra` folder, install its dependencies, and run the deploy command, passing the desired stage name as an argument.

```bash
# If you are in the services folder
cd ../infra

# Install infra dependencies
npm install

# Deploy to the 'dev' stage
npm run deploy dev
```

You can use any stage name you like, which is great for spinning up ephemeral test environments (e.g., `npm run deploy my-test`). Just make sure the profile for that stage is set correctly in the AWS credentials file.

The CDK will synthesize the stack and may prompt you to approve the creation of IAM roles and policies. Accept the changes to proceed. The deployment typically takes 4-5 minutes.

> **NOTE:** After a successful deployment, the script automatically writes the necessary environment variables (like API base URLs) into `.env` files. This makes it easy to start testing the system immediately. These files are configured for the two testing methods detailed in the upcoming sections: one for the VSCode REST Client and another for the Next.js UI.

---

## How to Teardown

If you want to teardown the deployed infrastructure in AWS just run the following command from the `infra` folder.

```bash
# Assuming you have deployed to the 'dev' stage
npm run destroy dev
```

---

## How to play with it

The repository also includes a simple UI for sending questions to the system and monitoring responses. It's a single-page application built with Next.js, located in the `ui` folder. This app isn't deployed to AWS, but you can easily run it locally since the required environment variables are injected by the `cdk-runner` script.

To get started, navigate to the `ui` folder and install the dependencies:

```bash
# From the repository root
cd ui
npm install
```

Then, launch the application, open it in your browser, ask a question, and watch the workflow unfold:

```bash
# Run the app in development mode
npm run dev
```
