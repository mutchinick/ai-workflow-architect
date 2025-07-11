import { z } from 'zod'
import { Failure, Result, Success } from '../../../errors/Result'

export type IncomingStartWorkflowRequestInput = {
  workflowId: string
}

type IncomingStartWorkflowRequestProps = {
  workflowId: string
}

/**
 *
 */
export class IncomingStartWorkflowRequest implements IncomingStartWorkflowRequestProps {
  /**
   *
   */
  private constructor(public readonly workflowId: string) {}

  /**
   *
   */
  public static fromInput(
    incomingStartWorkflowRequestInput: IncomingStartWorkflowRequestInput,
  ): Success<IncomingStartWorkflowRequest> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingStartWorkflowRequest.fromInput'
    console.info(`${logCtx} init:`, { incomingStartWorkflowRequestInput })

    const propsResult = this.buildProps(incomingStartWorkflowRequestInput)
    if (Result.isFailure(propsResult)) {
      console.error(`${logCtx} exit failure:`, { propsResult, incomingStartWorkflowRequestInput })
      return propsResult
    }

    const { workflowId } = propsResult.value
    const incomingStartWorkflowRequest = new IncomingStartWorkflowRequest(workflowId)
    const incomingStartWorkflowRequestResult = Result.makeSuccess(incomingStartWorkflowRequest)
    console.info(`${logCtx} exit success:`, { incomingStartWorkflowRequestResult })
    return incomingStartWorkflowRequestResult
  }

  /**
   *
   */
  private static buildProps(
    incomingStartWorkflowRequestInput: IncomingStartWorkflowRequestInput,
  ): Success<IncomingStartWorkflowRequestProps> | Failure<'InvalidArgumentsError'> {
    const inputValidationResult = this.parseValidateInput(incomingStartWorkflowRequestInput)
    if (Result.isFailure(inputValidationResult)) {
      return inputValidationResult
    }

    const { workflowId } = incomingStartWorkflowRequestInput
    const incomingStartWorkflowRequestProps: IncomingStartWorkflowRequestProps = { workflowId }
    return Result.makeSuccess(incomingStartWorkflowRequestProps)
  }

  /**
   *
   */
  private static parseValidateInput(
    input: IncomingStartWorkflowRequestInput,
  ): Success<IncomingStartWorkflowRequestInput> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'IncomingStartWorkflowRequest.validateInput'

    const schema = z.object({
      workflowId: z.string().trim().min(6),
    })

    try {
      const validInput = schema.parse(input)
      return Result.makeSuccess(validInput)
    } catch (error) {
      const failure = Result.makeFailure('InvalidArgumentsError', error, false)
      console.error(`${logCtx} exit failure:`, { failure, input })
      return failure
    }
  }
}
