import { Result } from '../../../errors/Result'
import {
  IncomingGetLatestWorkflowRequest,
  IncomingGetLatestWorkflowRequestProps,
} from './IncomingGetLatestWorkflowRequest'

const mockWorkflowId = 'mockWorkflowId'

function buildMockIncomingGetLatestWorkflowRequestProps(): IncomingGetLatestWorkflowRequestProps {
  const mockValidRequestProps: IncomingGetLatestWorkflowRequestProps = {
    workflowId: mockWorkflowId,
  }
  return mockValidRequestProps
}

describe(`Workflow Service GetLatestWorkflowApi IncomingGetLatestWorkflowRequest tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test IncomingGetLatestWorkflowRequestProps edge cases
   ************************************************************/
  it(`does not return a Failure if the input IncomingGetLatestWorkflowRequestProps is valid`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = buildMockIncomingGetLatestWorkflowRequestProps()
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequestProps is undefined`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = undefined as never
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequestProps is null`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = null as never
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   *
   ************************************************************
   * Test IncomingGetLatestWorkflowRequestProps.workflowId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequestProps.workflowId is undefined`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = buildMockIncomingGetLatestWorkflowRequestProps()
    mockIncomingGetLatestWorkflowRequestProps.workflowId = undefined as never
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequestProps.workflowId is null`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = buildMockIncomingGetLatestWorkflowRequestProps()
    mockIncomingGetLatestWorkflowRequestProps.workflowId = null as never
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequestProps.workflowId is empty`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = buildMockIncomingGetLatestWorkflowRequestProps()
    mockIncomingGetLatestWorkflowRequestProps.workflowId = '' as never
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequestProps.workflowId is blank`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = buildMockIncomingGetLatestWorkflowRequestProps()
    mockIncomingGetLatestWorkflowRequestProps.workflowId = '      ' as never
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      IncomingGetLatestWorkflowRequestProps.workflowId length < 6`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = buildMockIncomingGetLatestWorkflowRequestProps()
    mockIncomingGetLatestWorkflowRequestProps.workflowId = '12345' as never
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
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
  it(`returns the expected Success<IncomingGetLatestWorkflowRequest> if the execution path is
      successful`, () => {
    const mockIncomingGetLatestWorkflowRequestProps = buildMockIncomingGetLatestWorkflowRequestProps()
    const result = IncomingGetLatestWorkflowRequest.fromProps(mockIncomingGetLatestWorkflowRequestProps)
    const expectedRequest: IncomingGetLatestWorkflowRequest = {
      workflowId: mockIncomingGetLatestWorkflowRequestProps.workflowId,
    }
    Object.setPrototypeOf(expectedRequest, IncomingGetLatestWorkflowRequest.prototype)
    const expectedResult = Result.makeSuccess(expectedRequest)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
