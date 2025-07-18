import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { join } from 'path'
import { settings } from '../settings'

export interface ISendQueryApiLambdaConstructProps {
  dynamoDbTable: Table
  s3Bucket: Bucket
  httpApi: HttpApi
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
    const lambdaFunc = this.createSendQueryApiLambdaFunction(scope, id, props.dynamoDbTable, props.s3Bucket)
    this.createSendQueryApiLambdaIntegration(id, lambdaFunc, props.httpApi)
  }

  /**
   *
   */
  private createSendQueryApiLambdaFunction(
    scope: Construct,
    id: string,
    dynamoDbTable: Table,
    s3Bucket: Bucket,
  ): NodejsFunction {
    const lambdaFuncName = `${id}-Lambda`.slice(0, 64)
    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: join(__dirname, './sendQueryApiLambdaEntry.ts'),
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
        WORKFLOW_SERVICE_BUCKET_NAME: s3Bucket.bucketName,
      },
      timeout: settings.Lambda.timeout,
    })

    dynamoDbTable.grantReadWriteData(lambdaFunc)
    s3Bucket.grantReadWrite(lambdaFunc)

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
