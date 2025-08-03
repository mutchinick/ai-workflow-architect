import { Duration } from 'aws-cdk-lib'

export const settings = {
  SQS: {
    visibilityTimeout: Duration.seconds(29),
    receiveMessageWaitTime: Duration.seconds(20),
    maxReceiveCount: 10,
  },
  LambdaSQS: {
    batchSize: 10,
    reportBatchItemFailures: true,
    maxBatchingWindow: Duration.seconds(0),
    maxConcurrency: 2,
  },
  Lambda: {
    timeout: Duration.seconds(28),
    memorySize: 256,
  },
  LambdaIntegration: {
    timeout: Duration.seconds(29),
  },
}
