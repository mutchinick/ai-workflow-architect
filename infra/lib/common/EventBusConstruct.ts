import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { CfnPipe } from 'aws-cdk-lib/aws-pipes'
import { Construct } from 'constructs'

export interface IEventBusConstructProps {
  dynamoDbTable: Table
}

/**
 *
 */
export class EventBusConstruct extends Construct {
  public eventBus: EventBus

  /**
   *
   */
  constructor(scope: Construct, id: string, props: IEventBusConstructProps) {
    super(scope, id)
    this.eventBus = this.createEventBusEventBus(scope, id, props.dynamoDbTable)
  }

  /**
   *
   */
  private createEventBusEventBus(scope: Construct, id: string, dynamoDbTable: Table): EventBus {
    const eventBusName = `${id}-Bus`
    const eventBus = new EventBus(scope, eventBusName, {
      eventBusName,
    })

    const pipeRoleName = `${id}-EventBridgePipeRole`
    const pipeRole = new Role(this, pipeRoleName, {
      assumedBy: new ServicePrincipal('pipes.amazonaws.com'),
    })

    dynamoDbTable.grantStreamRead(pipeRole)
    eventBus.grantPutEventsTo(pipeRole)

    const pipeName = `${id}-DynamoDbToEventBridgePipe`
    new CfnPipe(this, pipeName, {
      roleArn: pipeRole.roleArn,
      source: dynamoDbTable.tableStreamArn!,
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: 'TRIM_HORIZON',
        },
      },
      target: eventBus.eventBusArn,
      targetParameters: {
        eventBridgeEventBusParameters: {
          detailType: 'DynamoDBStreamRecord',
          source: 'event-store.dynamodb.stream',
        },
      },
    })

    return eventBus
  }
}
