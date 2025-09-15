import { RemovalPolicy } from 'aws-cdk-lib'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
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

    const logGroup = new LogGroup(scope, `${lambdaFuncName}LogGroup`, {
      logGroupName: `/aws/lambda/${lambdaFuncName}`,
      retention: RetentionDays.INFINITE,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const servicesRoot = join(__dirname, '../../../services')

    const lambdaFunc = new NodejsFunction(scope, lambdaFuncName, {
      functionName: lambdaFuncName,
      runtime: Runtime.NODEJS_20_X,
      projectRoot: servicesRoot,
      depsLockFilePath: join(servicesRoot, 'package-lock.json'),
      entry: join(servicesRoot, 'src/workflow-service/handlers/sendQueryApi.ts'),
      handler: 'handler',
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
        WORKFLOW_SERVICE_BUCKET_NAME: s3Bucket.bucketName,
      },
      timeout: settings.API.TIMEOUT,
      logGroup,
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
