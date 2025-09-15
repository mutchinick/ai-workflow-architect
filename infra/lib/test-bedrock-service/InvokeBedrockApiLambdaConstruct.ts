import { RemovalPolicy } from 'aws-cdk-lib'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'
import { join } from 'path'
import { settings } from '../settings'

export interface IInvokeBedrockApiLambdaConstructProps {
  httpApi: HttpApi
}

/**
 *
 */
export class InvokeBedrockApiLambdaConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: IInvokeBedrockApiLambdaConstructProps) {
    super(scope, id)
    const lambdaFunc = this.createInvokeBedrockApiLambdaFunction(scope, id)
    this.createInvokeBedrockApiLambdaIntegration(id, lambdaFunc, props.httpApi)
  }

  /**
   *
   */
  private createInvokeBedrockApiLambdaFunction(scope: Construct, id: string): NodejsFunction {
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
      entry: join(servicesRoot, 'src/test-bedrock-service/handlers/invokeBedrockApi.ts'),
      handler: 'handler',
      environment: {
        BEDROCK_MODEL_ID: settings.Bedrock.MODEL_ID,
      },
      timeout: settings.API.TIMEOUT,
      logGroup,
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    })

    lambdaFunc.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
          'bedrock:InvokeModelWithInferenceProfile',
        ],
        resources: ['arn:aws:bedrock:*:*:foundation-model/*', 'arn:aws:bedrock:*:*:inference-profile/*'],
      }),
    )

    return lambdaFunc
  }

  /**
   *
   */
  private createInvokeBedrockApiLambdaIntegration(id: string, lambdaFunc: NodejsFunction, httpApi: HttpApi): void {
    const lambdaIntegrationName = `${id}-LambdaIntegration`
    const lambdaIntegration = new HttpLambdaIntegration(lambdaIntegrationName, lambdaFunc, {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
      timeout: settings.API.TIMEOUT,
    })

    httpApi.addRoutes({
      path: '/api/v1/test-bedrock-service/invokeBedrock',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
