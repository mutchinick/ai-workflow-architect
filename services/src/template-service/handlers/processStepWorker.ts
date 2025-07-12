import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { EventStoreClient } from '../../event-store/EventStoreClient'
import { ProcessStepWorkerController } from '../ProcessStepWorker/ProcessStepWorkerController/ProcessStepWorkerController'
import { ProcessStepWorkerService } from '../ProcessStepWorker/ProcessStepWorkerService/ProcessStepWorkerService'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const eventStoreClient = new EventStoreClient(ddbDocClient)
  const processStepWorkerService = new ProcessStepWorkerService(eventStoreClient)
  const processStepWorkerController = new ProcessStepWorkerController(processStepWorkerService)
  return processStepWorkerController.processSteps.bind(processStepWorkerController)
}

export const handler = createHandler()
