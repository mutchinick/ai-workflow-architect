import { RemovalPolicy } from 'aws-cdk-lib'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'
import { join } from 'path'
import { settings } from '../settings'

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
      entry: join(servicesRoot, 'src/test-template-service/handlers/createJobApi.ts'),
      handler: 'handler',
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
      },
      timeout: settings.Lambda.timeout,
      logGroup,
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
      path: '/api/v1/test-template-service/createJob',
      methods: [HttpMethod.POST],
      integration: lambdaIntegration,
    })
  }
}
