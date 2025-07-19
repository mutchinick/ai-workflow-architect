import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import { CreateJobApiLambdaConstruct } from './CreateJobApiLambdaConstruct'
import { ProcessStepWorkerConstruct } from './ProcessStepWorkerConstruct'
import { TemplateServiceApiConstruct } from './TemplateServiceApiConstruct'

export interface ITemplateServiceMainConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
}

/**
 *
 */
export class TemplateServiceMainConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: ITemplateServiceMainConstructProps) {
    super(scope, id)

    // API
    const templateServiceHttpApi = new TemplateServiceApiConstruct(scope, `${id}-Api`)

    new CreateJobApiLambdaConstruct(scope, `${id}-CreateJobApi`, {
      httpApi: templateServiceHttpApi.httpApi,
      dynamoDbTable: props.dynamoDbTable,
    })

    // Workers
    new ProcessStepWorkerConstruct(scope, `${id}-ProcessStepWorker`, {
      dynamoDbTable: props.dynamoDbTable,
      eventBus: props.eventBus,
    })
  }
}
