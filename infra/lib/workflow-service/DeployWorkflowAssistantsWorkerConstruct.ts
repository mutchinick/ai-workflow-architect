import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus, Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'
import { join } from 'path'
import { settings } from '../settings'

export interface IDeployWorkflowAssistantsWorkerConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
  s3Bucket: Bucket
}

/**
 *
 */
export class DeployWorkflowAssistantsWorkerConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: IDeployWorkflowAssistantsWorkerConstructProps) {
    super(scope, id)
    const dlq = this.createDeployWorkflowAssistantsWorkerDlq(scope, id)
    const queue = this.createDeployWorkflowAssistantsWorkerQueue(scope, id, dlq)
    this.createDeployWorkflowAssistantsWorkerFunction(scope, id, props.dynamoDbTable, props.s3Bucket, queue)
    this.createDeployWorkflowAssistantsWorkerRoutingRule(scope, id, props.dynamoDbTable, props.eventBus, queue)
  }

  /**
   *
   */
  private createDeployWorkflowAssistantsWorkerDlq(scope: Construct, id: string): Queue {
    const dlqName = `${id}-Dlq`
    const dlq = new Queue(scope, dlqName, {
      queueName: dlqName,
      retentionPeriod: Duration.days(14),
    })
    return dlq
  }

  /**
   *
   */
  private createDeployWorkflowAssistantsWorkerQueue(scope: Construct, id: string, dlq: Queue): Queue {
    const queueName = `${id}-Queue`
    const queue = new Queue(scope, queueName, {
      queueName,
      visibilityTimeout: settings.WORKER.TIMEOUT,
      receiveMessageWaitTime: settings.WORKER.RECEIVE_MESSAGE_WAIT_TIME,
      deadLetterQueue: {
        maxReceiveCount: settings.WORKER.MAX_RECEIVE_COUNT,
        queue: dlq,
      },
    })
    return queue
  }

  /**
   *
   */
  private createDeployWorkflowAssistantsWorkerFunction(
    scope: Construct,
    id: string,
    dynamoDbTable: Table,
    s3Bucket: Bucket,
    queue: Queue,
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
      entry: join(servicesRoot, 'src/workflow-service/handlers/deployWorkflowAssistantsWorker.ts'),
      handler: 'handler',
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
        WORKFLOW_SERVICE_BUCKET_NAME: s3Bucket.bucketName,
        BEDROCK_MODEL_ID: settings.Bedrock.MODEL_ID,
      },
      timeout: settings.WORKER.TIMEOUT,
      memorySize: settings.WORKER.MEMORY_SIZE_MB,
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

    lambdaFunc.addEventSource(
      new SqsEventSource(queue, {
        batchSize: settings.WORKER.BATCH_SIZE,
        reportBatchItemFailures: settings.WORKER.REPORT_BATCH_ITEM_FAILURES,
        maxBatchingWindow: settings.WORKER.MAX_BATCHING_WINDOW,
        maxConcurrency: settings.WORKER.MAX_CONCURRENCY,
      }),
    )

    dynamoDbTable.grantReadWriteData(lambdaFunc)
    queue.grantConsumeMessages(lambdaFunc)
    s3Bucket.grantReadWrite(lambdaFunc)

    return lambdaFunc
  }

  /**
   *
   */
  private createDeployWorkflowAssistantsWorkerRoutingRule(
    scope: Construct,
    id: string,
    dynamoDbTable: Table,
    eventBus: EventBus,
    queue: Queue,
  ): void {
    const ruleName = `${id}-EventBridgeRoutingRule`
    const routingRule = new Rule(scope, ruleName, {
      eventBus,
      eventPattern: {
        source: ['event-store.dynamodb.stream'],
        detailType: ['DynamoDBStreamRecord'],
        detail: {
          eventSourceARN: [dynamoDbTable.tableStreamArn],
          eventName: ['INSERT'],
          eventSource: ['aws:dynamodb'],
          dynamodb: {
            NewImage: {
              eventName: {
                S: ['WORKFLOW_CREATED_EVENT'],
              },
            },
          },
        },
      },
    })
    routingRule.addTarget(new SqsQueue(queue))
  }
}
