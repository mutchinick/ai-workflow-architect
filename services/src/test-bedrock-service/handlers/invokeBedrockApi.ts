import { bedrock } from '@ai-sdk/amazon-bedrock'
import { generateText } from 'ai'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { InvokeBedrockApiController } from '../InvokeBedrockApi/InvokeBedrockApiController/InvokeBedrockApiController'
import { InvokeBedrockApiService } from '../InvokeBedrockApi/InvokeBedrockApiService/InvokeBedrockApiService'
import { InvokeBedrockClient } from '../InvokeBedrockApi/InvokeBedrockClient/InvokeBedrockClient'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const modelId = process.env.BEDROCK_MODEL_ID ?? '' // FIXME: Handle missing model ID
  const languageModel = bedrock.languageModel(modelId)
  const invokeBedrockClient = new InvokeBedrockClient(languageModel, generateText)
  const invokeBedrockApiService = new InvokeBedrockApiService(invokeBedrockClient)
  const invokeBedrockApiController = new InvokeBedrockApiController(invokeBedrockApiService)
  return invokeBedrockApiController.invokeBedrock.bind(invokeBedrockApiController)
}

export const handler = createHandler()
