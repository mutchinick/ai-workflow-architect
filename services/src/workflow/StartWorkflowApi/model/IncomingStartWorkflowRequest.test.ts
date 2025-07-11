import { Result } from '../../../errors/Result'
import { IncomingStartWorkflowRequest, IncomingStartWorkflowRequestInput } from './IncomingStartWorkflowRequest'

const mockWorkflowId = 'mockWorkflowId'

function buildMockIncomingStartWorkflowRequestInput(): IncomingStartWorkflowRequestInput {
  const mockValidRequestInput: IncomingStartWorkflowRequestInput = {
    workflowId: mockWorkflowId,
  }
  return mockValidRequestInput
}

describe(`Workflow Service StartWorkflowApi IncomingStartWorkflowRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingStartWorkflowRequestInput edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingStartWorkflowRequestInput is
      valid`, () => {
    const mockIncomingStartWorkflowRequestInput = buildMockIncomingStartWorkflowRequestInput()
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequestInput is undefined`, () => {
    const mockIncomingStartWorkflowRequestInput = undefined as never
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequestInput is null`, () => {
    const mockIncomingStartWorkflowRequestInput = null as never
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingStartWorkflowRequestInput.workflowId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequestInput.workflowId is undefined`, () => {
    const mockIncomingStartWorkflowRequestInput = buildMockIncomingStartWorkflowRequestInput()
    mockIncomingStartWorkflowRequestInput.workflowId = undefined as never
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequestInput.workflowId is null`, () => {
    const mockIncomingStartWorkflowRequestInput = buildMockIncomingStartWorkflowRequestInput()
    mockIncomingStartWorkflowRequestInput.workflowId = null as never
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequestInput.workflowId is empty`, () => {
    const mockIncomingStartWorkflowRequestInput = buildMockIncomingStartWorkflowRequestInput()
    mockIncomingStartWorkflowRequestInput.workflowId = '' as never
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequestInput.workflowId is blank`, () => {
    const mockIncomingStartWorkflowRequestInput = buildMockIncomingStartWorkflowRequestInput()
    mockIncomingStartWorkflowRequestInput.workflowId = '      ' as never
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingStartWorkflowRequestInput.workflowId length < 6`, () => {
    const mockIncomingStartWorkflowRequestInput = buildMockIncomingStartWorkflowRequestInput()
    mockIncomingStartWorkflowRequestInput.workflowId = '12345' as never
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
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
  it(`returns the expected Success<IncomingStartWorkflowRequest> if the execution path
      is successful`, () => {
    const mockIncomingStartWorkflowRequestInput = buildMockIncomingStartWorkflowRequestInput()
    const result = IncomingStartWorkflowRequest.fromInput(mockIncomingStartWorkflowRequestInput)
    const expectedRequest: IncomingStartWorkflowRequest = {
      workflowId: mockIncomingStartWorkflowRequestInput.workflowId,
    }
    Object.setPrototypeOf(expectedRequest, IncomingStartWorkflowRequest.prototype)
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
