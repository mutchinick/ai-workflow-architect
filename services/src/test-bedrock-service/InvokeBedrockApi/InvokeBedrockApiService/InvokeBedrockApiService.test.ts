import { FailureKind } from '../../../errors/FailureKind'
import { Result } from '../../../errors/Result'
import { TypeUtilsMutable } from '../../../shared/TypeUtils'
import { IncomingInvokeBedrockRequest } from '../IncomingInvokeBedrockRequest/IncomingInvokeBedrockRequest'
import { IInvokeBedrockClient } from '../InvokeBedrockClient/InvokeBedrockClient'
import { InvokeBedrockApiService, InvokeBedrockApiServiceOutput } from './InvokeBedrockApiService'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockSystem = 'mockSystem'
const mockPrompt = 'mockPrompt'
const mockCompletion = 'mockCompletion'

function buildMockIncomingRequest(): TypeUtilsMutable<IncomingInvokeBedrockRequest> {
  const mockClass = IncomingInvokeBedrockRequest.fromProps({
    system: mockSystem,
    prompt: mockPrompt,
  })
  return Result.getSuccessValueOrThrow(mockClass)
}

const mockIncomingRequest = buildMockIncomingRequest()

/*
 *
 *
 ************************************************************
 * Mock clients
 ************************************************************/
function buildMockInvokeBedrockClient_succeeds(value?: unknown): IInvokeBedrockClient {
  const mockResult = Result.makeSuccess(value ?? mockCompletion)
  return { invoke: jest.fn().mockResolvedValue(mockResult) }
}

function buildMockInvokeBedrockClient_fails(
  failureKind?: FailureKind,
  error?: unknown,
  transient?: boolean,
): IInvokeBedrockClient {
  const mockFailure = Result.makeFailure(
    failureKind ?? 'UnrecognizedError',
    error ?? 'UnrecognizedError',
    transient ?? true,
  )
  return { invoke: jest.fn().mockResolvedValue(mockFailure) }
}

describe(`Test Bedrock Service InvokeBedrockApi InvokeBedrockApiService tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingInvokeBedrockRequest edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingInvokeBedrockRequest is valid`, async () => {
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const invokeBedrockApiService = new InvokeBedrockApiService(mockInvokeBedrockClient)
    const result = await invokeBedrockApiService.invokeBedrock(mockIncomingRequest)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequest is undefined`, async () => {
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const invokeBedrockApiService = new InvokeBedrockApiService(mockInvokeBedrockClient)
    const mockTestRequest = undefined as never
    const result = await invokeBedrockApiService.invokeBedrock(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequest is null`, async () => {
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const invokeBedrockApiService = new InvokeBedrockApiService(mockInvokeBedrockClient)
    const mockTestRequest = null as never
    const result = await invokeBedrockApiService.invokeBedrock(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequest is not an instance of the class`, async () => {
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const invokeBedrockApiService = new InvokeBedrockApiService(mockInvokeBedrockClient)
    const mockTestRequest = { ...mockIncomingRequest }
    const result = await invokeBedrockApiService.invokeBedrock(mockTestRequest)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls InvokeBedrockClient.invoke a single time`, async () => {
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const invokeBedrockApiService = new InvokeBedrockApiService(mockInvokeBedrockClient)
    await invokeBedrockApiService.invokeBedrock(mockIncomingRequest)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledTimes(1)
  })

  it(`calls InvokeBedrockClient.invoke with the expected input`, async () => {
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const invokeBedrockApiService = new InvokeBedrockApiService(mockInvokeBedrockClient)
    await invokeBedrockApiService.invokeBedrock(mockIncomingRequest)
    expect(mockInvokeBedrockClient.invoke).toHaveBeenCalledWith(mockSystem, mockPrompt)
  })

  it(`propagates the Failure if InvokeBedrockClient.invoke returns a Failure`, async () => {
    const mockFailureKind = 'mockFailureKind' as never
    const mockError = 'mockError'
    const mockTransient = 'mockTransient' as never
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_fails(mockFailureKind, mockError, mockTransient)
    const invokeBedrockApiService = new InvokeBedrockApiService(mockInvokeBedrockClient)
    const result = await invokeBedrockApiService.invokeBedrock(mockIncomingRequest)
    const expectedResult = Result.makeFailure(mockFailureKind, mockError, mockTransient)
    expect(Result.isFailure(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<InvokeBedrockApiServiceOutput> if the execution
      path is successful`, async () => {
    const mockInvokeBedrockClient = buildMockInvokeBedrockClient_succeeds()
    const invokeBedrockApiService = new InvokeBedrockApiService(mockInvokeBedrockClient)
    const result = await invokeBedrockApiService.invokeBedrock(mockIncomingRequest)
    const expectedOutput: InvokeBedrockApiServiceOutput = {
      completion: mockCompletion,
    }
    const expectedResult = Result.makeSuccess(expectedOutput)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
