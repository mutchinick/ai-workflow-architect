import { GetObjectCommand, ListObjectsV2Command, S3Client, S3ServiceException } from '@aws-sdk/client-s3'
import { Failure, Result, Success } from '../../errors/Result'
import { Workflow } from './Workflow'

export interface IReadLatestWorkflowClient {
  readLatest: (
    prefix: string,
  ) => Promise<
    | Success<Workflow>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class ReadLatestWorkflowClient implements IReadLatestWorkflowClient {
  /**
   *
   */
  constructor(private readonly s3Client: S3Client) {}

  /**
   *
   */
  public async readLatest(
    prefix: string,
  ): Promise<
    | Success<Workflow>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ReadLatestWorkflowClient.read'
    console.info(`${logCtx} init:`, { prefix })

    const inputValidationResult = this.validateInput(prefix)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, prefix })
      return inputValidationResult
    }

    const buildListCommandResult = this.buildListObjectsCommand(prefix)
    if (Result.isFailure(buildListCommandResult)) {
      console.error(`${logCtx} exit failure:`, { buildListCommandResult, prefix })
      return buildListCommandResult
    }

    const listCommand = buildListCommandResult.value
    const latestObjectKeyResult = await this.sendListObjectsCommand(listCommand)
    if (Result.isFailure(latestObjectKeyResult)) {
      console.error(`${logCtx} exit failure:`, { latestObjectKeyResult, prefix })
      return latestObjectKeyResult
    }
    const latestObjectKey = latestObjectKeyResult.value

    const buildGetObjectCommandResult = this.buildGetObjectCommand(latestObjectKey)
    if (Result.isFailure(buildGetObjectCommandResult)) {
      // NOTE: Unreachable code for tests, but necessary for production code
      console.error(`${logCtx} exit failure:`, { buildGetObjectCommandResult, prefix })
      return buildGetObjectCommandResult
    }

    const getObjectCommand = buildGetObjectCommandResult.value
    const sendCommandResult = await this.sendGetObjectCommand(getObjectCommand)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logCtx} exit failure:`, { sendCommandResult, prefix })
      : console.info(`${logCtx} exit success:`, { sendCommandResult, prefix })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(prefix: string): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ReadLatestWorkflowClient.validateInput'

    if (!prefix) {
      const message = `Missing prefix`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildListObjectsCommand(prefix: string): Success<ListObjectsV2Command> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ReadLatestWorkflowClient.buildListObjectsCommand'
    console.info(`${logCtx} init:`, { prefix })

    try {
      const bucketName = process.env.WORKFLOW_SERVICE_BUCKET_NAME
      if (!bucketName) {
        throw new Error('Missing WORKFLOW_SERVICE_BUCKET_NAME environment variable')
      }

      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      })

      const commandResult = Result.makeSuccess(command)
      console.info(`${logCtx} exit success:`, { commandResult })
      return commandResult
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, prefix })
      return failure
    }
  }

  /**
   *
   */
  private async sendListObjectsCommand(
    command: ListObjectsV2Command,
  ): Promise<Success<string> | Failure<'WorkflowFileNotFoundError'> | Failure<'UnrecognizedError'>> {
    const logCtx = 'ReadLatestWorkflowClient.sendListObjectsCommand'
    console.info(`${logCtx} init:`, { command })

    try {
      const listResponse = await this.s3Client.send(command)

      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        const message = `No workflow files found in S3 with prefix ${command.input.Prefix}`
        const failure = Result.makeFailure('WorkflowFileNotFoundError', message, false)
        console.error(`${logCtx} exit failure:`, { failure })
        return failure
      }

      const latestObject = listResponse.Contents[listResponse.Contents.length - 1]

      if (!latestObject.Key) {
        const message = `Found an object without a key for prefix ${command.input.Prefix}`
        const failure = Result.makeFailure('WorkflowFileNotFoundError', message, false)
        console.error(`${logCtx} exit failure:`, { failure })
        return failure
      }

      console.info(`${logCtx} exit success:`, { latestObjectKey: latestObject.Key })
      return Result.makeSuccess(latestObject.Key)
    } catch (error) {
      console.error(`${logCtx} error caught:`, { error })
      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logCtx} exit failure:`, { unrecognizedFailure })
      return unrecognizedFailure
    }
  }

  /**
   *
   */
  private buildGetObjectCommand(objectKey: string): Success<GetObjectCommand> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ReadLatestWorkflowClient.buildGetObjectCommand'
    console.info(`${logCtx} init:`, { objectKey })

    try {
      const bucketName = process.env.WORKFLOW_SERVICE_BUCKET_NAME
      if (!bucketName) {
        // NOTE: Unreachable code for tests, but necessary for production code
        throw new Error('Missing WORKFLOW_SERVICE_BUCKET_NAME environment variable')
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })

      const commandResult = Result.makeSuccess(command)
      console.info(`${logCtx} exit success:`, { commandResult })
      return commandResult
    } catch (error) {
      // NOTE: Unreachable code for tests, but necessary for production code
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, objectKey })
      return failure
    }
  }

  /**
   *
   */
  private async sendGetObjectCommand(
    command: GetObjectCommand,
  ): Promise<
    | Success<Workflow>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ReadLatestWorkflowClient.sendGetObjectCommand'
    console.info(`${logCtx} init:`, { command })

    try {
      const s3CommandOutput = await this.s3Client.send(command)
      const fileContents = await s3CommandOutput.Body?.transformToString()
      const workflowData = JSON.parse(fileContents || '{}')
      const workflowResult = Workflow.fromProps(workflowData)
      if (Result.isFailure(workflowResult)) {
        console.error(`${logCtx} exit failure:`, { workflowResult, objectKey: command.input.Key })
        const failure = Result.makeFailure('WorkflowFileCorruptedError', workflowResult.error, false)
        return failure
      }

      console.info(`${logCtx} exit success:`, { workflowResult })
      return workflowResult
    } catch (error) {
      console.error(`${logCtx} error caught:`, { error })

      if (error instanceof S3ServiceException && error.name === 'NoSuchKey') {
        const message = `Workflow not found in S3 with objectKey ${command.input.Key}`
        const failure = Result.makeFailure('WorkflowFileNotFoundError', message, false)
        console.error(`${logCtx} exit failure:`, { failure })
        return failure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logCtx} exit failure:`, { unrecognizedFailure })
      return unrecognizedFailure
    }
  }
}
