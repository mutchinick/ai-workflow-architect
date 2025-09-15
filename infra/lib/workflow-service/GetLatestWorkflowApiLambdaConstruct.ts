import { RemovalPolicy } from 'aws-cdk-lib'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { join } from 'path'
import { settings } from '../settings'

export interface IGetLatestWorkflowApiLambdaConstructProps {
  s3Bucket: Bucket
  httpApi: HttpApi
}

/**
 *
 */
export class GetLatestWorkflowApiLambdaConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: IGetLatestWorkflowApiLambdaConstructProps) {
    super(scope, id)
    const lambdaFunc = this.createGetLatestWorkflowApiLambdaFunction(scope, id, props.s3Bucket)
    this.createGetLatestWorkflowApiLambdaIntegration(id, lambdaFunc, props.httpApi)
  }

  /**
   *
   */
  private createGetLatestWorkflowApiLambdaFunction(scope: Construct, id: string, s3Bucket: Bucket): NodejsFunction {
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
      entry: join(servicesRoot, 'src/workflow-service/handlers/getLatestWorkflowApi.ts'),
      handler: 'handler',
      environment: {
        WORKFLOW_SERVICE_BUCKET_NAME: s3Bucket.bucketName,
      },
      timeout: settings.API.TIMEOUT,
      logGroup,
    })

    s3Bucket.grantReadWrite(lambdaFunc)

    return lambdaFunc
  }

  /**
   *
   */
  private createGetLatestWorkflowApiLambdaIntegration(id: string, lambdaFunc: NodejsFunction, httpApi: HttpApi): void {
    const lambdaIntegrationName = `${id}-LambdaIntegration`
    const lambdaIntegration = new HttpLambdaIntegration(lambdaIntegrationName, lambdaFunc, {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
    })

    httpApi.addRoutes({
      path: '/api/v1/workflow-service/getLatestWorkflow',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
