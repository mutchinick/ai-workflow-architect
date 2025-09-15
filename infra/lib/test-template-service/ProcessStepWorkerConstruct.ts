import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import { EventBus, Rule } from 'aws-cdk-lib/aws-events'
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'
import { join } from 'path'
import { settings } from '../settings'

export interface IProcessStepWorkerConstructProps {
  dynamoDbTable: Table
  eventBus: EventBus
}

/**
 *
 */
export class ProcessStepWorkerConstruct extends Construct {
  /**
   *
   */
  constructor(scope: Construct, id: string, props: IProcessStepWorkerConstructProps) {
    super(scope, id)
    const dlq = this.createProcessStepWorkerDlq(scope, id)
    const queue = this.createProcessStepWorkerQueue(scope, id, dlq)
    this.createProcessStepWorkerFunction(scope, id, props.dynamoDbTable, queue)
    this.createProcessStepWorkerRoutingRule(scope, id, props.dynamoDbTable, props.eventBus, queue)
  }

  /**
   *
   */
  private createProcessStepWorkerDlq(scope: Construct, id: string): Queue {
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
  private createProcessStepWorkerQueue(scope: Construct, id: string, dlq: Queue): Queue {
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
  private createProcessStepWorkerFunction(
    scope: Construct,
    id: string,
    dynamoDbTable: Table,
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
      entry: join(servicesRoot, 'src/test-template-service/handlers/processStepWorker.ts'),
      handler: 'handler',
      environment: {
        EVENT_STORE_TABLE_NAME: dynamoDbTable.tableName,
      },
      timeout: settings.WORKER.TIMEOUT,
      logGroup,
    })

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

    return lambdaFunc
  }

  /**
   *
   */
  private createProcessStepWorkerRoutingRule(
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
                S: ['JOB_CREATED_EVENT'],
              },
            },
          },
        },
      },
    })
    routingRule.addTarget(new SqsQueue(queue))
  }
}
