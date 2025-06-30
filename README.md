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
