import { Duration } from 'aws-cdk-lib'

export const settings = {
  WORKER: {
    TIMEOUT: Duration.seconds(60),
    MEMORY_SIZE_MB: 256,
    MAX_CONCURRENCY: 2,
    MAX_RECEIVE_COUNT: 10,
    RECEIVE_MESSAGE_WAIT_TIME: Duration.seconds(20),
    BATCH_SIZE: 10,
    MAX_BATCHING_WINDOW: Duration.seconds(0),
    REPORT_BATCH_ITEM_FAILURES: true,
  },
  API: {
    TIMEOUT: Duration.seconds(29),
    MEMORY_SIZE_MB: 256,
  },
  Bedrock: {
    MODEL_ID: 'us.meta.llama4-scout-17b-instruct-v1:0',
    // MODEL_ID: 'meta.llama3-3-70b-instruct-v1:0',
    // MODEL_ID: 'us.amazon.nova-premier-v1:0',
    // MODEL_ID: 'us.meta.llama3-3-70b-instruct-v1:0',
    // MODEL_ID: 'us.deepseek.r1-v1:0',
    // MODEL_ID: 'us.mistral.mistral-large-2402-v1:0',
    // MODEL_ID: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
  },
}
