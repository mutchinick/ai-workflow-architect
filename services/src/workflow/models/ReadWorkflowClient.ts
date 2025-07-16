import { GetObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3'
import { Failure, Result, Success } from '../../errors/Result'
import { Workflow } from './Workflow'

/**
 *
 */
export class ReadWorkflowClient {
  /**
   *
   */
  constructor(private readonly s3Client: S3Client) {}

  /**
   *
   */
  public async read(
    objectKey: string,
  ): Promise<
    | Success<Workflow>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ReadWorkflowClient.read'
    console.info(`${logCtx} init:`, { objectKey })

    const inputValidationResult = this.validateInput(objectKey)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, objectKey })
      return inputValidationResult
    }

    const buildCommandResult = this.buildS3Command(objectKey)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logCtx} exit failure:`, { buildCommandResult, objectKey })
      return buildCommandResult
    }

    const s3Command = buildCommandResult.value
    const sendCommandResult = await this.sendS3Command(s3Command)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logCtx} exit failure:`, { sendCommandResult, objectKey })
      : console.info(`${logCtx} exit success:`, { sendCommandResult, objectKey })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(objectKey: string): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ReadWorkflowClient.validateInput'

    if (!objectKey) {
      const message = `Missing objectKey`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildS3Command(objectKey: string): Success<GetObjectCommand> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'ReadWorkflowClient.buildS3Command'

    try {
      const bucketName = process.env.WORKFLOW_BUCKET_NAME
      if (!bucketName) {
        throw new Error('Missing WORKFLOW_BUCKET_NAME environment variable')
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })

      return Result.makeSuccess(command)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, objectKey })
      return failure
    }
  }

  /**
   *
   */
  private async sendS3Command(
    command: GetObjectCommand,
  ): Promise<
    | Success<Workflow>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'ReadWorkflowClient.sendS3Command'
    console.info(`${logCtx} init:`)

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
      console.error(`${logCtx} exit failure:`, { failure: unrecognizedFailure })
      return unrecognizedFailure
    }
  }
}
