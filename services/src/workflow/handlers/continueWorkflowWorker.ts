import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { SQSBatchResponse, SQSEvent } from 'aws-lambda'
import { EventStoreClient } from '../../event-store/EventStoreClient'
import { ContinueWorkflowWorkerController } from '../ContinueWorkflowWorker/ContinueWorkflowWorkerController/ContinueWorkflowWorkerController'
import { ContinueWorkflowWorkerService } from '../ContinueWorkflowWorker/ContinueWorkflowWorkerService/ContinueWorkflowWorkerService'

/**
 *
 */
function createHandler(): (sqsEvent: SQSEvent) => Promise<SQSBatchResponse> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const eventStoreClient = new EventStoreClient(ddbDocClient)
  const continueWorkflowWorkerService = new ContinueWorkflowWorkerService(eventStoreClient)
  const continueWorkflowWorkerController = new ContinueWorkflowWorkerController(continueWorkflowWorkerService)
  return continueWorkflowWorkerController.continueWorkflows.bind(continueWorkflowWorkerController)
}

export const handler = createHandler()
