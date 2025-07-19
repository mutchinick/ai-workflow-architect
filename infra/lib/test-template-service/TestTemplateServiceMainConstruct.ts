import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import { CreateJobApiLambdaConstruct } from './CreateJobApiLambdaConstruct'
import { ProcessStepWorkerConstruct } from './ProcessStepWorkerConstruct'
import { TestTemplateServiceApiConstruct } from './TestTemplateServiceApiConstruct'

export interface ITestTemplateServiceMainConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
}

/**
 *
 */
export class TestTemplateServiceMainConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: ITestTemplateServiceMainConstructProps) {
    super(scope, id)

    // API
    const testTemplateServiceHttpApi = new TestTemplateServiceApiConstruct(scope, `${id}-Api`)

    new CreateJobApiLambdaConstruct(scope, `${id}-CreateJobApi`, {
      httpApi: testTemplateServiceHttpApi.httpApi,
      dynamoDbTable: props.dynamoDbTable,
    })

    // Workers
    new ProcessStepWorkerConstruct(scope, `${id}-ProcessStepWorker`, {
      dynamoDbTable: props.dynamoDbTable,
      eventBus: props.eventBus,
    })
  }
}
