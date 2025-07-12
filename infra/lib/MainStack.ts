import * as cdk from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { DynamoDbConstruct } from './common/DynamoDbConstruct'
import { EventBusConstruct } from './common/EventBusConstruct'
import { S3BucketConstruct } from './common/S3BucketConstruct'
import { TemplateServiceMainConstruct } from './template-service/TemplateServiceMainConstruct'

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dynamoDbTable, eventBus, bucket } = this.createCommon(id)

    // TemplateService
    new TemplateServiceMainConstruct(this, `${id}-TemplateService`, {
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
    bucket: Bucket
  } {
    const serviceId = `${id}-Common`
    const ddbConstructName = `${serviceId}-DynamoDb`
    const ddbConstruct = new DynamoDbConstruct(this, ddbConstructName)

    const eventBusConstructName = `${serviceId}-EventBus`
    const eventBusConstruct = new EventBusConstruct(this, eventBusConstructName, {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
    })

    const bucketConstructName = `${serviceId}-S3Bucket`
    const bucketConstruct = new S3BucketConstruct(this, bucketConstructName)

    return {
      dynamoDbTable: ddbConstruct.dynamoDbTable,
      eventBus: eventBusConstruct.eventBus,
      bucket: bucketConstruct.bucket,
    }
  }
}
