import { Result } from '../../../errors/Result'
import { IncomingSendQueryRequest, IncomingSendQueryRequestProps } from './IncomingSendQueryRequest'

const mockQuery = 'mockQuery'
const mockPromptEnhanceRounds = 3
const mockResponseEnhanceRounds = 2

function buildMockIncomingSendQueryRequestProps(): IncomingSendQueryRequestProps {
  const mockValidRequestProps: IncomingSendQueryRequestProps = {
    query: mockQuery,
    promptEnhanceRounds: mockPromptEnhanceRounds,
    responseEnhanceRounds: mockResponseEnhanceRounds,
  }
  return mockValidRequestProps
}

describe(`Template Service SendQueryApi IncomingSendQueryRequest tests`, () => {
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
   * Test IncomingSendQueryRequestProps.promptEnhanceRounds edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.promptEnhanceRounds is undefined`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.promptEnhanceRounds = undefined as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.promptEnhanceRounds is null`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.promptEnhanceRounds = null as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.promptEnhanceRounds is < 1`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.promptEnhanceRounds = 0 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.promptEnhanceRounds is > 10`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.promptEnhanceRounds = 11 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.promptEnhanceRounds is not an integer`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.promptEnhanceRounds = 3.45 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.promptEnhanceRounds is not an number`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.promptEnhanceRounds = '3' as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingSendQueryRequestProps.responseEnhanceRounds edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.responseEnhanceRounds is undefined`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.responseEnhanceRounds = undefined as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.responseEnhanceRounds is null`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.responseEnhanceRounds = null as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.responseEnhanceRounds is < 1`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.responseEnhanceRounds = 0 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.responseEnhanceRounds is > 10`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.responseEnhanceRounds = 11 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.responseEnhanceRounds is not an integer`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.responseEnhanceRounds = 3.45 as never
    const result = IncomingSendQueryRequest.fromProps(mockIncomingSendQueryRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingSendQueryRequestProps.responseEnhanceRounds is not an number`, () => {
    const mockIncomingSendQueryRequestProps = buildMockIncomingSendQueryRequestProps()
    mockIncomingSendQueryRequestProps.responseEnhanceRounds = '3' as never
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
      promptEnhanceRounds: mockIncomingSendQueryRequestProps.promptEnhanceRounds,
      responseEnhanceRounds: mockIncomingSendQueryRequestProps.responseEnhanceRounds,
    }
    Object.setPrototypeOf(expectedRequest, IncomingSendQueryRequest.prototype)
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
