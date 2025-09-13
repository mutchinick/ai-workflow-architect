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
  BedrockModelId: 'meta.llama3-3-70b-instruct-v1:0',
  // BedrockModelId: 'us.amazon.nova-premier-v1:0',
  // BedrockModelId: 'us.meta.llama3-3-70b-instruct-v1:0',
  // BedrockModelId: 'us.meta.llama4-scout-17b-instruct-v1:0',
  // BedrockModelId: 'us.deepseek.r1-v1:0',
  // BedrockModelId: 'us.mistral.mistral-large-2402-v1:0',
  // BedrockModelId: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
}
