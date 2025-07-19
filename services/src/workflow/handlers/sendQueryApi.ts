import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { EventStoreClient } from '../../event-store/EventStoreClient'
import { SendQueryApiController } from '../SendQueryApi/SendQueryApiController/SendQueryApiController'
import { SendQueryApiService } from '../SendQueryApi/SendQueryApiService/SendQueryApiService'
import { SaveWorkflowClient } from '../models/SaveWorkflowClient'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const s3Client = new S3Client({})
  const ddbClient = new DynamoDBClient({})
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient)
  const saveWorkflowClient = new SaveWorkflowClient(s3Client)
  const eventStoreClient = new EventStoreClient(ddbDocClient)
  const sendQueryApiService = new SendQueryApiService(saveWorkflowClient, eventStoreClient)
  const sendQueryApiController = new SendQueryApiController(sendQueryApiService)
  return sendQueryApiController.sendQuery.bind(sendQueryApiController)
}

export const handler = createHandler()
