import { bedrock } from '@ai-sdk/amazon-bedrock'
import { generateText } from 'ai'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { InvokeBedrockApiController } from '../InvokeBedrockApi/InvokeBedrockApiController/InvokeBedrockApiController'
import { InvokeBedrockApiService } from '../InvokeBedrockApi/InvokeBedrockApiService/InvokeBedrockApiService'
import { InvokeBedrockClient } from '../InvokeBedrockApi/InvokeBedrockClient/InvokeBedrockClient'

// Some available models:
// meta.llama3-3-70b-instruct-v1:0
// meta.llama4-maverick-17b-instruct-v1:0
// deepseek.r1-v1:0

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const modelId = 'meta.llama3-3-70b-instruct-v1:0'
  const languageModel = bedrock.languageModel(modelId)
  const invokeBedrockClient = new InvokeBedrockClient(languageModel, generateText)
  const invokeBedrockApiService = new InvokeBedrockApiService(invokeBedrockClient)
  const invokeBedrockApiController = new InvokeBedrockApiController(invokeBedrockApiService)
  return invokeBedrockApiController.invokeBedrock.bind(invokeBedrockApiController)
}

export const handler = createHandler()
