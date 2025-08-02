import { bedrock } from '@ai-sdk/amazon-bedrock'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { generateText } from 'ai'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { EventStoreClient } from '../../event-store/EventStoreClient'
import { InvokeBedrockClient } from '../InvokeBedrockClient/InvokeBedrockClient'
import { ReadWorkflowClient } from '../models/ReadWorkflowClient'
import { SaveWorkflowClient } from '../models/SaveWorkflowClient'
import { ProcessWorkflowStepWorkerController } from '../ProcessWorkflowStepWorker/ProcessWorkflowStepWorkerController/ProcessWorkflowStepWorkerController'
import { ProcessWorkflowStepWorkerService } from '../ProcessWorkflowStepWorker/ProcessWorkflowStepWorkerService/ProcessWorkflowStepWorkerService'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const s3Client = new S3Client({})
  const readWorkflowClient = new ReadWorkflowClient(s3Client)
  const saveWorkflowClient = new SaveWorkflowClient(s3Client)

  const modelId = 'meta.llama3-3-70b-instruct-v1:0'
  const languageModel = bedrock.languageModel(modelId)
  const invokeBedrockClient = new InvokeBedrockClient(languageModel, generateText)

  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const eventStoreClient = new EventStoreClient(ddbDocClient)

  const processWorkflowStepWorkerService = new ProcessWorkflowStepWorkerService(
    readWorkflowClient,
    invokeBedrockClient,
    saveWorkflowClient,
    eventStoreClient,
  )
  const processWorkflowStepWorkerController = new ProcessWorkflowStepWorkerController(processWorkflowStepWorkerService)

  return processWorkflowStepWorkerController.processWorkflowStep.bind(processWorkflowStepWorkerController)
}

export const handler = createHandler()
