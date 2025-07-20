import { Result } from '../../../errors/Result'
import { IncomingInvokeBedrockRequest, IncomingInvokeBedrockRequestProps } from './IncomingInvokeBedrockRequest'

const mockSystem = 'mockSystem'
const mockPrompt = 'mockPrompt'

function buildMockIncomingInvokeBedrockRequestProps(): IncomingInvokeBedrockRequestProps {
  const mockValidRequestProps: IncomingInvokeBedrockRequestProps = {
    system: mockSystem,
    prompt: mockPrompt,
  }
  return mockValidRequestProps
}

describe(`Test Bedrock Service InvokeBedrockApi IncomingInvokeBedrockRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingInvokeBedrockRequestProps edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingInvokeBedrockRequestProps is valid`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps is undefined`, () => {
    const mockIncomingInvokeBedrockRequestProps = undefined as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps is null`, () => {
    const mockIncomingInvokeBedrockRequestProps = null as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingInvokeBedrockRequestProps.system edge cases
   ************************************************************/
  it(`does not return a Failure if the input
      IncomingInvokeBedrockRequestProps.system is undefined`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    mockIncomingInvokeBedrockRequestProps.system = undefined as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps.system is null`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    mockIncomingInvokeBedrockRequestProps.system = null as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps.system not a string`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    mockIncomingInvokeBedrockRequestProps.system = 123 as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingInvokeBedrockRequestProps.prompt edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps.prompt is undefined`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    mockIncomingInvokeBedrockRequestProps.prompt = undefined as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps.prompt is null`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    mockIncomingInvokeBedrockRequestProps.prompt = null as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps.prompt is empty`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    mockIncomingInvokeBedrockRequestProps.prompt = '' as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps.prompt is blank`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    mockIncomingInvokeBedrockRequestProps.prompt = '      ' as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingInvokeBedrockRequestProps.prompt length < 6`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    mockIncomingInvokeBedrockRequestProps.prompt = '12345' as never
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test expected results
   ************************************************************/
  it(`returns the expected Success<IncomingInvokeBedrockRequest> if the execution path is
      successful`, () => {
    const mockIncomingInvokeBedrockRequestProps = buildMockIncomingInvokeBedrockRequestProps()
    const result = IncomingInvokeBedrockRequest.fromProps(mockIncomingInvokeBedrockRequestProps)
    const expectedRequest: IncomingInvokeBedrockRequest = {
      system: mockIncomingInvokeBedrockRequestProps.system,
      prompt: mockIncomingInvokeBedrockRequestProps.prompt,
    }
    Object.setPrototypeOf(expectedRequest, IncomingInvokeBedrockRequest.prototype)
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
