import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'
import { InvokeBedrockApiLambdaConstruct } from './InvokeBedrockApiLambdaConstruct'
import { TestBedrockServiceApiConstruct } from './TestBedrockServiceApiConstruct'

export interface ITestBedrockServiceMainConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
}

/**
 *
 */
export class TestBedrockServiceMainConstruct extends Construct {
  /**
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(scope: Construct, id: string, props: ITestBedrockServiceMainConstructProps) {
    super(scope, id)

    // API
    const testBedrockServiceHttpApi = new TestBedrockServiceApiConstruct(scope, `${id}-Api`)

    new InvokeBedrockApiLambdaConstruct(scope, `${id}-InvokeBedrockApi`, {
      httpApi: testBedrockServiceHttpApi.httpApi,
    })
  }
}
