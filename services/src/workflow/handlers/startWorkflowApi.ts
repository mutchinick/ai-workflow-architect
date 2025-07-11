import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { EventStoreClient } from '../../event-store/EventStoreClient'
import { StartWorkflowApiController } from '../StartWorkflowApi/StartWorkflowApiController/StartWorkflowApiController'
import { StartWorkflowApiService } from '../StartWorkflowApi/StartWorkflowApiService/StartWorkflowApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const eventStoreClient = new EventStoreClient(ddbDocClient)
  const startWorkflowApiService = new StartWorkflowApiService(eventStoreClient)
  const startWorkflowApiController = new StartWorkflowApiController(startWorkflowApiService)
  return startWorkflowApiController.startWorkflow.bind(startWorkflowApiController)
}

export const handler = createHandler()
