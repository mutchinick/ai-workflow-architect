import { Result } from '../../../errors/Result'
import { IncomingCreateJobRequest, IncomingCreateJobRequestInput } from './IncomingCreateJobRequest'

const mockJobId = 'mockJobId'

function buildMockIncomingCreateJobRequestInput(): IncomingCreateJobRequestInput {
  const mockValidRequestInput: IncomingCreateJobRequestInput = {
    jobId: mockJobId,
  }
  return mockValidRequestInput
}

describe(`Template Service CreateJobApi IncomingCreateJobRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingCreateJobRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingCreateJobRequestInput is valid`, () => {
    const mockIncomingCreateJobRequestInput = buildMockIncomingCreateJobRequestInput()
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequestInput is undefined`, () => {
    const mockIncomingCreateJobRequestInput = undefined as never
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequestInput is null`, () => {
    const mockIncomingCreateJobRequestInput = null as never
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingCreateJobRequestInput.jobId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequestInput.jobId is undefined`, () => {
    const mockIncomingCreateJobRequestInput = buildMockIncomingCreateJobRequestInput()
    mockIncomingCreateJobRequestInput.jobId = undefined as never
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequestInput.jobId is null`, () => {
    const mockIncomingCreateJobRequestInput = buildMockIncomingCreateJobRequestInput()
    mockIncomingCreateJobRequestInput.jobId = null as never
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequestInput.jobId is empty`, () => {
    const mockIncomingCreateJobRequestInput = buildMockIncomingCreateJobRequestInput()
    mockIncomingCreateJobRequestInput.jobId = '' as never
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequestInput.jobId is blank`, () => {
    const mockIncomingCreateJobRequestInput = buildMockIncomingCreateJobRequestInput()
    mockIncomingCreateJobRequestInput.jobId = '      ' as never
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingCreateJobRequestInput.jobId length < 6`, () => {
    const mockIncomingCreateJobRequestInput = buildMockIncomingCreateJobRequestInput()
    mockIncomingCreateJobRequestInput.jobId = '12345' as never
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
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
  it(`returns the expected Success<IncomingCreateJobRequest> if the execution path is
      successful`, () => {
    const mockIncomingCreateJobRequestInput = buildMockIncomingCreateJobRequestInput()
    const result = IncomingCreateJobRequest.fromInput(mockIncomingCreateJobRequestInput)
    const expectedRequest: IncomingCreateJobRequest = {
      jobId: mockIncomingCreateJobRequestInput.jobId,
    }
    Object.setPrototypeOf(expectedRequest, IncomingCreateJobRequest.prototype)
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
