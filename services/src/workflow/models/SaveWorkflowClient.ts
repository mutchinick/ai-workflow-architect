import { PutObjectCommand, S3Client, S3ServiceException } from '@aws-sdk/client-s3'
import { Failure, Result, Success } from '../../errors/Result'
import { Workflow } from './Workflow'

export interface ISaveWorkflowClient {
  save: (
    workflow: Workflow,
  ) => Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateWorkflowError'> | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class SaveWorkflowClient {
  /**
   *
   */
  constructor(private readonly s3Client: S3Client) {}

  /**
   *
   */
  public async save(
    workflow: Workflow,
  ): Promise<
    Success<void> | Failure<'InvalidArgumentsError'> | Failure<'DuplicateWorkflowError'> | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'SaveWorkflowClient.save'
    console.info(`${logCtx} init:`, { workflow })

    const inputValidationResult = this.validateInput(workflow)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, workflow })
      return inputValidationResult
    }

    const buildCommandResult = this.buildS3Command(workflow)
    if (Result.isFailure(buildCommandResult)) {
      console.error(`${logCtx} exit failure:`, { buildCommandResult, workflow })
      return buildCommandResult
    }

    const s3Command = buildCommandResult.value
    const sendCommandResult = await this.sendS3Command(s3Command)
    Result.isFailure(sendCommandResult)
      ? console.error(`${logCtx} exit failure:`, { sendCommandResult, workflow })
      : console.info(`${logCtx} exit success:`, { sendCommandResult, workflow })

    return sendCommandResult
  }

  /**
   *
   */
  private validateInput(workflow: Workflow): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'SaveWorkflowClient.validateInput'

    if (workflow instanceof Workflow === false) {
      const message = `Expected instance of Workflow but got ${workflow}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure })
      return failure
    }

    if (!workflow.workflowId) {
      const message = `Missing workflowId`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildS3Command(workflow: Workflow): Success<PutObjectCommand> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'SaveWorkflowClient.buildS3Command'

    try {
      const bucketName = process.env.WORKFLOW_SERVICE_BUCKET_NAME
      if (!bucketName) {
        throw new Error('Missing WORKFLOW_SERVICE_BUCKET_NAME environment variable')
      }

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: workflow.getObjectKey(),
        Body: JSON.stringify(workflow.toJSON()),
        IfNoneMatch: '*',
      })

      return Result.makeSuccess(command)
    } catch (error) {
      console.error(`${logCtx} error caught:`, { error, workflow })
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, workflow })
      return failure
    }
  }

  /**
   *
   */
  private async sendS3Command(
    command: PutObjectCommand,
  ): Promise<Success<void> | Failure<'DuplicateWorkflowError'> | Failure<'UnrecognizedError'>> {
    const logCtx = 'SaveWorkflowClient.sendS3Command'
    console.info(`${logCtx} init:`)

    try {
      await this.s3Client.send(command)
      const result = Result.makeSuccess()
      console.info(`${logCtx} exit success:`, { result, command })
      return result
    } catch (error) {
      if (error instanceof S3ServiceException && error.name === 'PreconditionFailed') {
        const message = `Workflow file already exists in S3`
        const duplicationFailure = Result.makeFailure('DuplicateWorkflowError', message, false)
        console.error(`${logCtx} exit failure:`, { failure: duplicationFailure })
        return duplicationFailure
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', error, true)
      console.error(`${logCtx} exit failure:`, { failure: unrecognizedFailure })
      return unrecognizedFailure
    }
  }
}
