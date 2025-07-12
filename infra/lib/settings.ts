import { Duration } from 'aws-cdk-lib'

export const settings = {
  SQS: {
    visibilityTimeout: Duration.seconds(10),
    receiveMessageWaitTime: Duration.seconds(20),
    maxReceiveCount: 360,
  },
  LambdaSQS: {
    batchSize: 10,
    reportBatchItemFailures: true,
    maxBatchingWindow: Duration.seconds(0),
    maxConcurrency: 2,
  },
}
