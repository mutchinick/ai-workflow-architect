import { RemovalPolicy } from 'aws-cdk-lib'
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

/**
 *
 */
export class DynamoDbConstruct extends Construct {
  public dynamoDbTable: Table

  /**
   *
   */
  constructor(scope: Construct, id: string) {
    super(scope, id)
    this.dynamoDbTable = this.createDynamoDbTable(scope, id)
  }

  /**
   *
   */
  private createDynamoDbTable(scope: Construct, id: string): Table {
    const tableName = `${id}-Table`
    const dynamoDbTable = new Table(scope, tableName, {
      tableName,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_IMAGE,
    })

    dynamoDbTable.addGlobalSecondaryIndex({
      indexName: 'gsi1pk-gsi1sk-index',
      partitionKey: {
        name: 'gsi1pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'gsi1sk',
        type: AttributeType.STRING,
      },
    })

    dynamoDbTable.applyRemovalPolicy(RemovalPolicy.DESTROY)

    return dynamoDbTable
  }
}
