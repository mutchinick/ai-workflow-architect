import { Duration } from 'aws-cdk-lib'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export interface ISendQueryApiLambdaConstructProps {
  httpApi: HttpApi
  dynamoDbTable: Table
}

/**
 *
 */
export class SendQueryApiLambdaConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: ISendQueryApiLambdaConstructProps) {
    super(scope, id)
    const lambdaFunc = this.createSendQueryApiLambdaFunction(scope, id, props.dynamoDbTable)
    this.createSendQueryApiLambdaIntegration(id, lambdaFunc, props.httpApi)
  }

  /**
   *
   */
  private createSendQueryApiLambdaFunction(scope: Construct, id: string, dynamoDbTable: Table): NodejsFunction {
    const lambdaFuncName = `${id}-Lambda`.slice(0, 64)
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './sendQueryApiLambdaEntry.ts'),
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
      },
      timeout: Duration.seconds(10),
    })

    dynamoDbTable.grantReadWriteData(lambdaFunc)

    return lambdaFunc
  }

  /**
   *
   */
  private createSendQueryApiLambdaIntegration(id: string, lambdaFunc: NodejsFunction, httpApi: HttpApi): void {
    const lambdaIntegrationName = `${id}-LambdaIntegration`
    const lambdaIntegration = new HttpLambdaIntegration(lambdaIntegrationName, lambdaFunc, {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    })

    httpApi.addRoutes({
      path: '/api/v1/workflow-service/sendQuery',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
