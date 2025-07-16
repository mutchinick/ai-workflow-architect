import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { EventStoreClient } from '../../event-store/EventStoreClient'
import { SendQueryApiController } from '../SendQueryApi/SendQueryApiController/SendQueryApiController'
import { SendQueryApiService } from '../SendQueryApi/SendQueryApiService/SendQueryApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const eventStoreClient = new EventStoreClient(ddbDocClient)
  const sendQueryApiService = new SendQueryApiService(eventStoreClient)
  const sendQueryApiController = new SendQueryApiController(sendQueryApiService)
  return sendQueryApiController.sendQuery.bind(sendQueryApiController)
}

export const handler = createHandler()
