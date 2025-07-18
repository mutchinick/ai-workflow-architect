import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import { SendQueryApiLambdaConstruct } from './SendQueryApiLambdaConstruct'
import { WorkflowServiceApiConstruct } from './WorkflowServiceApiConstruct'

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

    // API
    const workflowServiceHttpApi = new WorkflowServiceApiConstruct(scope, `${id}-Api`)

    new SendQueryApiLambdaConstruct(scope, `${id}-SendQueryApi`, {
      httpApi: workflowServiceHttpApi.httpApi,
      dynamoDbTable: props.dynamoDbTable,
    })

    // Workers
  }
}
