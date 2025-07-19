import * as cdk from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import { DynamoDbConstruct } from './common/DynamoDbConstruct'
import { EventBusConstruct } from './common/EventBusConstruct'
import { TestTemplateServiceMainConstruct } from './test-template-service/TestTemplateServiceMainConstruct'
import { WorkflowServiceMainConstruct } from './workflow-service/WorkflowServiceMainConstruct'

export interface IMainStackProps extends cdk.StackProps {
  config: {
    deploymentPrefix: string
  }
}

/**
 *
 */
export class MainStack extends cdk.Stack {
  /**
   *
   */
  constructor(scope: Construct, id: string, props?: IMainStackProps) {
    super(scope, id, props)

    // Common
    const { dynamoDbTable, eventBus } = this.createCommon(id)

    // TestTemplateService
    new TestTemplateServiceMainConstruct(this, `${id}-TestTemplateService`, {
      dynamoDbTable,
      eventBus,
    })

    // WorkflowService
    new WorkflowServiceMainConstruct(this, `${id}-WorkflowService`, {
      dynamoDbTable,
      eventBus,
    })
  }

  /**
   *
   */
  private createCommon(id: string): {
    dynamoDbTable: Table
    eventBus: EventBus
  } {
    const serviceId = `${id}-Common`
    const ddbConstructName = `${serviceId}-DynamoDb`
    const ddbConstruct = new DynamoDbConstruct(this, ddbConstructName)

    const eventBusConstructName = `${serviceId}-EventBus`
    const eventBusConstruct = new EventBusConstruct(this, eventBusConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
    })

    return {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
      eventBus: eventBusConstruct.eventBus,
    }
  }
}
