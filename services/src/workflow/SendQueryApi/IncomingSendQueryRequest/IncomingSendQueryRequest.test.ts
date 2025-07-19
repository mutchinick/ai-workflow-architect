import { Result } from '../../../errors/Result'
import { IncomingSendQueryRequest, IncomingSendQueryRequestProps } from './IncomingSendQueryRequest'

const mockQuery = 'mockQuery'
const mockEnhancePromptRounds = 3
const mockEnhanceResultRounds = 2

function buildMockIncomingSendQueryRequestProps(): IncomingSendQueryRequestProps {
  const mockValidRequestProps: IncomingSendQueryRequestProps = {
    query: mockQuery,
    enhancePromptRounds: mockEnhancePromptRounds,
    enhanceResultRounds: mockEnhanceResultRounds,
  }
  return mockValidRequestProps
}

describe(`Workflow Service SendQueryApi IncomingSendQueryRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingSendQueryRequestProps edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingSendQueryRequestProps is valid`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps is undefined`, () => {
    const mockIncomingSendQueryRequestProps = undefined as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps is null`, () => {
    const mockIncomingSendQueryRequestProps = null as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSendQueryRequestProps.query edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.query is undefined`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.query = undefined as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.query is null`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.query = null as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.query is empty`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.query = '' as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.query is blank`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.query = '      ' as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.query length < 6`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.query = '12345' as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSendQueryRequestProps.enhancePromptRounds edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhancePromptRounds is undefined`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhancePromptRounds = undefined as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhancePromptRounds is null`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhancePromptRounds = null as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhancePromptRounds is < 1`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhancePromptRounds = 0 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhancePromptRounds is > 10`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhancePromptRounds = 11 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhancePromptRounds is not an integer`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhancePromptRounds = 3.45 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhancePromptRounds is not an number`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhancePromptRounds = '3' as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSendQueryRequestProps.enhanceResultRounds edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhanceResultRounds is undefined`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhanceResultRounds = undefined as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhanceResultRounds is null`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhanceResultRounds = null as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhanceResultRounds is < 1`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhanceResultRounds = 0 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhanceResultRounds is > 10`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhanceResultRounds = 11 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhanceResultRounds is not an integer`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhanceResultRounds = 3.45 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.enhanceResultRounds is not an number`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.enhanceResultRounds = '3' as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
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
  it(`returns the expected Success<IncomingSendQueryRequest> if the execution path is
      successful`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    const expectedRequest: IncomingSendQueryRequest = {
      query: mockIncomingSendQueryRequestProps.query,
      enhancePromptRounds: mockIncomingSendQueryRequestProps.enhancePromptRounds,
      enhanceResultRounds: mockIncomingSendQueryRequestProps.enhanceResultRounds,
    }
    Object.setPrototypeOf(expectedRequest, IncomingSendQueryRequest.prototype)
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
