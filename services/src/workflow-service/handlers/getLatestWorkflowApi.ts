import { S3Client } from '@aws-sdk/client-s3'
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { GetLatestWorkflowApiController } from '../GetLatestWorkflowApi/GetLatestWorkflowApiController/GetLatestWorkflowApiController'
import { GetLatestWorkflowApiService } from '../GetLatestWorkflowApi/GetLatestWorkflowApiService/GetLatestWorkflowApiService'
import { ReadLatestWorkflowClient } from '../models/ReadLatestWorkflowClient'

/**
 *
 */
function createHandler(): (apiEvent: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2> {
  const s3Client = new S3Client({})
  const readLatestWorkflowClient = new ReadLatestWorkflowClient(s3Client)
  const getLatestWorkflowApiService = new GetLatestWorkflowApiService(readLatestWorkflowClient)
  const getLatestWorkflowApiController = new GetLatestWorkflowApiController(getLatestWorkflowApiService)
  return getLatestWorkflowApiController.getLatestWorkflow.bind(getLatestWorkflowApiController)
}

export const handler = createHandler()
