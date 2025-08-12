import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import { DeployWorkflowAssistantsWorkerConstruct } from './DeployWorkflowAssistantsWorkerConstruct'
import { GetLatestWorkflowApiLambdaConstruct } from './GetLatestWorkflowApiLambdaConstruct'
import { ProcessWorkflowStepWorkerConstruct } from './ProcessWorkflowStepWorkerConstruct'
import { SendQueryApiLambdaConstruct } from './SendQueryApiLambdaConstruct'
import { WorkflowServiceApiConstruct } from './WorkflowServiceApiConstruct'
import { WorkflowServiceS3BucketConstruct } from './WorkflowServiceS3BucketConstruct'

export interface IWorkflowServiceMainConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
}

/**
 *
 */
export class WorkflowServiceMainConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: IWorkflowServiceMainConstructProps) {
    super(scope, id)

    // S3 Bucket
    const bucketConstructName = `${id}-S3`
    const bucketConstruct = new WorkflowServiceS3BucketConstruct(this, bucketConstructName)

    // API
    const workflowServiceHttpApi = new WorkflowServiceApiConstruct(scope, `${id}-Api`)

    new SendQueryApiLambdaConstruct(scope, `${id}-SendQueryApi`, {
      dynamoDbTable: props.dynamoDbTable,
      s3Bucket: bucketConstruct.s3Bucket,
      httpApi: workflowServiceHttpApi.httpApi,
    })

    new GetLatestWorkflowApiLambdaConstruct(scope, `${id}-GetLatestWorkflowApi`, {
      s3Bucket: bucketConstruct.s3Bucket,
      httpApi: workflowServiceHttpApi.httpApi,
    })

    // Workers
    new DeployWorkflowAssistantsWorkerConstruct(scope, `${id}-DeployWorkflowAssistantsWorker`, {
      dynamoDbTable: props.dynamoDbTable,
      eventBus: props.eventBus,
      s3Bucket: bucketConstruct.s3Bucket,
    })

    new ProcessWorkflowStepWorkerConstruct(scope, `${id}-ProcessWorkflowStepWorker`, {
      dynamoDbTable: props.dynamoDbTable,
      eventBus: props.eventBus,
      s3Bucket: bucketConstruct.s3Bucket,
    })
  }
}
