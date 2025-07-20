import { APICallError, GenerateTextResult, LanguageModel } from 'ai'
import { Result } from '../../../errors/Result'
import { InvokeBedrockClient } from './InvokeBedrockClient'

/*
 *
 *
 ************************************************************
 * Mock setup
 ************************************************************/

const mockSystem = 'mockSystem'
const mockPrompt = 'mockPrompt'
const mockResponseText = 'mockResponseText'

// A mock LanguageModel object that satisfies the type dependency.
const mockModel = {
  id: 'mockModel',
  provider: 'mockProvider',
} as unknown as LanguageModel

type GenerateTextFunction = (config: {
  model: LanguageModel
  system?: string
  prompt: string
}) => Promise<GenerateTextResult<Record<string, never>, string>>

function buildMockGenerateText_resolves(value?: string): jest.MockedFunction<GenerateTextFunction> {
  return jest.fn().mockResolvedValue({
    text: value ?? mockResponseText,
    toolCalls: [],
    toolResults: [],
    finishReason: 'stop',
    usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  })
}

function buildMockGenerateText_throws(error?: unknown): jest.MockedFunction<GenerateTextFunction> {
  return jest.fn().mockRejectedValue(error ?? new Error('Unknown'))
}

/*
 *
 *
 ************************************************************
 * InvokeBedrockClient tests
 ************************************************************/
describe(`Test Bedrock Service InvokeBedrockApi InvokeBedrockClient tests`, () => {
  /*
   *
   ************************************************************
   * Test prompt edge cases
   ************************************************************/
  it(`does not return a Failure if the input prompt is valid`, async () => {
    const mockGenerateText = buildMockGenerateText_resolves()
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    const result = await invokeBedrockClient.invoke(mockSystem, mockPrompt)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      prompt is undefined`, async () => {
    const mockGenerateText = buildMockGenerateText_resolves()
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    const prompt = undefined as never
    const result = await invokeBedrockClient.invoke(mockSystem, prompt)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      prompt is null`, async () => {
    const mockGenerateText = buildMockGenerateText_resolves()
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    const prompt = null as never
    const result = await invokeBedrockClient.invoke(mockSystem, prompt)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      prompt is an empty string`, async () => {
    const mockGenerateText = buildMockGenerateText_resolves()
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    const prompt = ''
    const result = await invokeBedrockClient.invoke(mockSystem, prompt)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls generateTextFn a single time`, async () => {
    const mockGenerateText = buildMockGenerateText_resolves()
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    await invokeBedrockClient.invoke(mockSystem, mockPrompt)
    expect(mockGenerateText).toHaveBeenCalledTimes(1)
  })

  it(`calls generateTextFn with the expected GenerationConfig if the input system is provided`, async () => {
    const mockGenerateText = buildMockGenerateText_resolves()
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    await invokeBedrockClient.invoke(mockSystem, mockPrompt)
    expect(mockGenerateText).toHaveBeenCalledWith({
      model: mockModel,
      system: mockSystem,
      prompt: mockPrompt,
    })
  })

  it(`calls generateTextFn with the expected GenerationConfig if the input system is not provided`, async () => {
    const mockGenerateText = buildMockGenerateText_resolves()
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    await invokeBedrockClient.invoke('', mockPrompt)
    expect(mockGenerateText).toHaveBeenCalledWith({
      model: mockModel,
      prompt: mockPrompt,
    })
  })

  it(`returns a transient Failure of kind TestBedrockTransientError if generateTextFn
      throws a retryable APICallError`, async () => {
    const retryableError = new APICallError({
      requestBodyValues: {},
      url: 'mockUrl',
      message: 'Retryable error',
      isRetryable: true,
      statusCode: 500,
    })
    const mockGenerateText = buildMockGenerateText_throws(retryableError)
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    const result = await invokeBedrockClient.invoke(mockSystem, mockPrompt)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'TestBedrockTransientError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind TestBedrockPermanentError if generateTextFn
      throws a non-retryable APICallError`, async () => {
    const permanentError = new APICallError({
      requestBodyValues: {},
      url: 'mockUrl',
      message: 'Permanent error',
      isRetryable: false,
      statusCode: 400,
    })
    const mockGenerateText = buildMockGenerateText_throws(permanentError)
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    const result = await invokeBedrockClient.invoke(mockSystem, mockPrompt)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'TestBedrockPermanentError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a transient Failure of kind UnrecognizedError if generateTextFn throws an
      unrecognized error`, async () => {
    const mockGenerateText = buildMockGenerateText_throws(new Error('Something went wrong'))
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    const result = await invokeBedrockClient.invoke(mockSystem, mockPrompt)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  /*
   *
   ************************************************************
   * Test expected result
   ************************************************************/
  it(`returns the expected Success<string> if the execution path is successful`, async () => {
    const mockGenerateText = buildMockGenerateText_resolves()
    const invokeBedrockClient = new InvokeBedrockClient(mockModel, mockGenerateText)
    const result = await invokeBedrockClient.invoke(mockSystem, mockPrompt)
    const expectedResult = Result.makeSuccess(mockResponseText)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
