import { bedrock } from '@ai-sdk/amazon-bedrock'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { generateText } from 'ai'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { EventStoreClient } from '../../event-store/EventStoreClient'
import { DeployWorkflowAssistantsWorkerController } from '../DeployWorkflowAssistantsWorker/DeployWorkflowAssistantsWorkerController/DeployWorkflowAssistantsWorkerController'
import { DeployWorkflowAssistantsWorkerService } from '../DeployWorkflowAssistantsWorker/DeployWorkflowAssistantsWorkerService/DeployWorkflowAssistantsWorkerService'
import { InvokeBedrockClient } from '../InvokeBedrockClient/InvokeBedrockClient'
import { ReadWorkflowClient } from '../models/ReadWorkflowClient'
import { SaveWorkflowClient } from '../models/SaveWorkflowClient'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const s3Client = new S3Client({})
  const readWorkflowClient = new ReadWorkflowClient(s3Client)
  const saveWorkflowClient = new SaveWorkflowClient(s3Client)

  const modelId = process.env.BEDROCK_MODEL_ID ?? '' // FIXME: Handle missing model ID
  const languageModel = bedrock.languageModel(modelId)
  const invokeBedrockClient = new InvokeBedrockClient(languageModel, generateText)

  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const eventStoreClient = new EventStoreClient(ddbDocClient)

  const deployWorkflowAssistantsWorkerService = new DeployWorkflowAssistantsWorkerService(
    readWorkflowClient,
    invokeBedrockClient,
    saveWorkflowClient,
    eventStoreClient,
  )
  const deployWorkflowAssistantsWorkerController = new DeployWorkflowAssistantsWorkerController(
    deployWorkflowAssistantsWorkerService,
  )

  return deployWorkflowAssistantsWorkerController.deployWorkflowAssistants.bind(
    deployWorkflowAssistantsWorkerController,
  )
}

export const handler = createHandler()
