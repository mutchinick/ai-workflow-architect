import { Duration } from 'aws-cdk-lib'

export const settings = {
  SQS: {
    visibilityTimeout: Duration.seconds(31),
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
    timeout: Duration.seconds(30),
  },
}
