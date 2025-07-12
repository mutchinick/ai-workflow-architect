import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { EventStoreClient } from '../../event-store/EventStoreClient'
import { CreateJobApiController } from '../CreateJobApi/CreateJobApiController/CreateJobApiController'
import { CreateJobApiService } from '../CreateJobApi/CreateJobApiService/CreateJobApiService'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const eventStoreClient = new EventStoreClient(ddbDocClient)
  const createJobApiService = new CreateJobApiService(eventStoreClient)
  const createJobApiController = new CreateJobApiController(createJobApiService)
  return createJobApiController.createJob.bind(createJobApiController)
}

export const handler = createHandler()
