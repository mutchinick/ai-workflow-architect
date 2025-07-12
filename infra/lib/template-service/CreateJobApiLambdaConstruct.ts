import { Duration } from 'aws-cdk-lib'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import { join } from 'path'

export interface ICreateJobApiLambdaConstructProps {
  httpApi: HttpApi
  dynamoDbTable: Table
}

/**
 *
 */
export class CreateJobApiLambdaConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: ICreateJobApiLambdaConstructProps) {
    super(scope, id)
    const lambdaFunc = this.createCreateJobApiLambdaFunction(scope, id, props.dynamoDbTable)
    this.createCreateJobApiLambdaIntegration(id, lambdaFunc, props.httpApi)
  }

  /**
   *
   */
  private createCreateJobApiLambdaFunction(scope: Construct, id: string, dynamoDbTable: Table): NodejsFunction {
    const lambdaFuncName = `${id}-Lambda`.slice(0, 64)
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './createJobApiLambdaEntry.ts'),
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
  private createCreateJobApiLambdaIntegration(id: string, lambdaFunc: NodejsFunction, httpApi: HttpApi): void {
    const lambdaIntegrationName = `${id}-LambdaIntegration`
    const lambdaIntegration = new HttpLambdaIntegration(lambdaIntegrationName, lambdaFunc, {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    })

    httpApi.addRoutes({
      path: '/api/v1/template-service/createJob',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
