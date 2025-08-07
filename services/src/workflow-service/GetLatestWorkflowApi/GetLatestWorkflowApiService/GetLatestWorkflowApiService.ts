import { Failure, Result, Success } from '../../../errors/Result'
import { TypeUtilsPretty } from '../../../shared/TypeUtils'
import { IReadLatestWorkflowClient } from '../../models/ReadLatestWorkflowClient'
import { Workflow, WorkflowProps } from '../../models/Workflow'
import { IncomingGetLatestWorkflowRequest } from '../IncomingGetLatestWorkflowRequest/IncomingGetLatestWorkflowRequest'

export interface IGetLatestWorkflowApiService {
  getLatestWorkflow: (
    incomingRequest: IncomingGetLatestWorkflowRequest,
  ) => Promise<
    | Success<GetLatestWorkflowApiServiceOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  >
}

export type GetLatestWorkflowApiServiceOutput = TypeUtilsPretty<WorkflowProps>

/**
 *
 */
export class GetLatestWorkflowApiService implements IGetLatestWorkflowApiService {
  /**
   *
   */
  constructor(private readonly readLatestWorkflowClient: IReadLatestWorkflowClient) {}

  /**
   *
   */
  public async getLatestWorkflow(
    incomingRequest: IncomingGetLatestWorkflowRequest,
  ): Promise<
    | Success<GetLatestWorkflowApiServiceOutput>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'GetLatestWorkflowApiService.getLatestWorkflow'
    console.info(`${logCtx} init:`, { incomingRequest })

    const inputValidationResult = this.validateInput(incomingRequest)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult, incomingRequest })
      return inputValidationResult
    }

    const readLatestWorkflowResult = await this.readLatestWorkflow(incomingRequest)
    if (Result.isFailure(readLatestWorkflowResult)) {
      console.error(`${logCtx} exit failure:`, { readLatestWorkflowResult, incomingRequest })
      return readLatestWorkflowResult
    }

    const output: GetLatestWorkflowApiServiceOutput = readLatestWorkflowResult.value.toJSON()
    const getLatestWorkflowResult = Result.makeSuccess(output)
    console.info(`${logCtx} exit success:`, { getLatestWorkflowResult, incomingRequest })
    return getLatestWorkflowResult
  }

  /**
   *
   */
  private validateInput(
    incomingRequest: IncomingGetLatestWorkflowRequest,
  ): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'GetLatestWorkflowApiService.validateInput'
    console.info(`${logCtx} init:`, { incomingRequest })

    if (incomingRequest instanceof IncomingGetLatestWorkflowRequest === false) {
      const message = `Expected IncomingGetLatestWorkflowRequest but got ${incomingRequest}`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure, incomingRequest })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private async readLatestWorkflow(
    incomingRequest: IncomingGetLatestWorkflowRequest,
  ): Promise<
    | Success<Workflow>
    | Failure<'InvalidArgumentsError'>
    | Failure<'WorkflowFileNotFoundError'>
    | Failure<'WorkflowFileCorruptedError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'GetLatestWorkflowApiService.readLatestWorkflow'
    console.info(`${logCtx} init:`, { incomingRequest })

    const { workflowId } = incomingRequest
    const readLatestWorkflowResult = await this.readLatestWorkflowClient.readLatest(workflowId)

    Result.isFailure(readLatestWorkflowResult)
      ? console.error(`${logCtx} exit failure:`, { readLatestWorkflowResult, incomingRequest })
      : console.info(`${logCtx} exit success:`, { readLatestWorkflowResult, incomingRequest })

    return readLatestWorkflowResult
  }
}
