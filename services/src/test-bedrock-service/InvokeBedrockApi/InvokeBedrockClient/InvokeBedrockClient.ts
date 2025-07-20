import { APICallError, GenerateTextResult, LanguageModel } from 'ai'
import { Failure, Result, Success } from '../../../errors/Result'

interface GenerationConfig {
  model: LanguageModel
  system: string | undefined
  prompt: string
}

type GenerateTextFunction = (config: GenerationConfig) => Promise<GenerateTextResult<Record<string, never>, string>>

export interface IInvokeBedrockClient {
  /**
   *
   */
  invoke: (
    system: string,
    prompt: string,
  ) => Promise<
    | Success<string>
    | Failure<'InvalidArgumentsError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  >
}

/**
 *
 */
export class InvokeBedrockClient implements IInvokeBedrockClient {
  /**
   *
   */
  constructor(
    private readonly model: LanguageModel,
    private readonly generateTextFn: GenerateTextFunction,
  ) {}

  /**
   *
   */
  public async invoke(
    system: string,
    prompt: string,
  ): Promise<
    | Success<string>
    | Failure<'InvalidArgumentsError'>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'InvokeBedrockClient.invoke'
    console.info(`${logCtx} init:`, { system, prompt })

    const inputValidationResult = this.validateInput(prompt)
    if (Result.isFailure(inputValidationResult)) {
      console.error(`${logCtx} exit failure:`, { inputValidationResult })
      return inputValidationResult
    }

    const generationConfig = this.buildGenerationConfig(system, prompt)

    const sendRequestResult = await this.sendGenerationRequest(generationConfig)

    Result.isFailure(sendRequestResult)
      ? console.error(`${logCtx} exit failure:`, { sendRequestResult, generationConfig })
      : console.info(`${logCtx} exit success`, { sendRequestResult, generationConfig })

    return sendRequestResult
  }

  /**
   *
   */
  private validateInput(prompt: string): Success<void> | Failure<'InvalidArgumentsError'> {
    const logCtx = 'InvokeBedrockClient.validateInput'

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      const message = `Missing or invalid prompt`
      const failure = Result.makeFailure('InvalidArgumentsError', message, false)
      console.error(`${logCtx} exit failure:`, { failure })
      return failure
    }

    return Result.makeSuccess()
  }

  /**
   *
   */
  private buildGenerationConfig(system: string, prompt: string): GenerationConfig {
    return {
      model: this.model,
      system: system || undefined,
      prompt,
    }
  }

  /**
   *
   */
  private async sendGenerationRequest(
    generationConfig: GenerationConfig,
  ): Promise<
    | Success<string>
    | Failure<'BedrockInvokeTransientError'>
    | Failure<'BedrockInvokePermanentError'>
    | Failure<'UnrecognizedError'>
  > {
    const logCtx = 'InvokeBedrockClient.sendGenerationRequest'

    try {
      const { text } = await this.generateTextFn(generationConfig)
      const bedrockTextResult = Result.makeSuccess(text)
      console.info(`${logCtx} exit success:`, { result: bedrockTextResult })
      return bedrockTextResult
    } catch (error) {
      if (error instanceof APICallError) {
        if (error.isRetryable) {
          const transientFailure = Result.makeFailure('BedrockInvokeTransientError', error, true)
          console.error(`${logCtx} exit failure:`, { transientFailure, generationConfig })
          return transientFailure
        } else {
          const permanentFailure = Result.makeFailure('BedrockInvokePermanentError', error, false)
          console.error(`${logCtx} exit failure:`, { permanentFailure, generationConfig })
          return permanentFailure
        }
      }

      const unrecognizedFailure = Result.makeFailure('UnrecognizedError', String(error), true)
      console.error(`${logCtx} exit failure:`, { unrecognizedFailure })
      return unrecognizedFailure
    }
  }
}
