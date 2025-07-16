import { S3Client, S3ServiceException } from '@aws-sdk/client-s3'
import { Result } from '../../errors/Result'
import { TypeUtilsMutable } from '../../shared/TypeUtils'
import { SaveWorkflowClient } from './SaveWorkflowClient'
import { Workflow, WorkflowProps } from './Workflow'

/*
 *
 *
 ************************************************************
 * Mock setup
 ************************************************************/
const mockBucket = 'mockWorkflowBucket'
process.env.WORKFLOW_BUCKET_NAME = mockBucket

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockWorkflowId = 'mockWorkflowId'
const mockQuery = 'mockQuery'
const mockEnhancePromptRounds = 3
const mockEnhanceResultRounds = 2

function buildMockWorkflowProps(): WorkflowProps {
  return {
    workflowId: mockWorkflowId,
    input: {
      query: mockQuery,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    },
    steps: [],
  }
}

function buildValidWorkflow(): Workflow {
  const props = buildMockWorkflowProps()
  const result = Workflow.fromProps(props)
  if (Result.isFailure(result)) throw new Error('Test setup failed')
  return result.value
}

function buildMockS3Client_resolves(): S3Client {
  return { send: jest.fn() } as unknown as S3Client
}

function buildMockS3Client_throws(error?: unknown): S3Client {
  return { send: jest.fn().mockRejectedValue(error ?? new Error('Unknown')) } as unknown as S3Client
}

/*
 *
 *
 ************************************************************
 * SaveWorkflowClient tests
 ************************************************************/
describe(`Workflow SaveWorkflowClient tests`, () => {
  /*
   *
   ************************************************************
   * Test Workflow edge cases
   ************************************************************/
  it(`does not return a Failure if the input Workflow is valid`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const workflow = buildValidWorkflow()
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      Workflow is undefined`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const workflow = undefined as never
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      Workflow is null`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const workflow = null as never
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      Workflow is not an instance of the class`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const props = buildMockWorkflowProps()
    const workflow = { ...props } as never
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   ************************************************************
   * Test Workflow.workflowId edge cases
   ************************************************************/
  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      workflowId is undefined`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const props = buildMockWorkflowProps()
    const workflowResult = Workflow.fromProps(props)
    const workflow = Result.getSuccessValueOrThrow(workflowResult)
    ;(workflow as TypeUtilsMutable<Workflow>).workflowId = undefined as never
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      Workflow.workflowId is an null`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const props = buildMockWorkflowProps()
    const workflowResult = Workflow.fromProps(props)
    const workflow = Result.getSuccessValueOrThrow(workflowResult)
    ;(workflow as TypeUtilsMutable<Workflow>).workflowId = null as never
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      Workflow.workflowId is an empty string`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const props = buildMockWorkflowProps()
    const workflowResult = Workflow.fromProps(props)
    const workflow = Result.getSuccessValueOrThrow(workflowResult)
    ;(workflow as TypeUtilsMutable<Workflow>).workflowId = '' as never
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls S3Client.send a single time`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const workflow = buildValidWorkflow()
    await saveWorkflow.save(workflow)
    expect(mockS3Client.send).toHaveBeenCalledTimes(1)
  })

  it(`calls S3Client.send with a PutObjectCommand and expected input`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const workflow = buildValidWorkflow()
    await saveWorkflow.save(workflow)
    expect(mockS3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: mockBucket,
          Key: workflow.getObjectKey(),
          Body: JSON.stringify(workflow.toJSON()),
          IfNoneMatch: '*',
        },
      }),
    )
  })

  it(`returns a transient Failure of kind UnrecognizedError if S3Client.send throws an
      unrecognized error`, async () => {
    const mockS3Client = buildMockS3Client_throws()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const workflow = buildValidWorkflow()
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind DuplicateWorkflowError if S3Client.send
      throws a PreconditionFailed`, async () => {
    const preconditionFailedError = new S3ServiceException({
      name: 'PreconditionFailed',
      $fault: 'server',
      $metadata: {},
    })
    const mockS3Client = buildMockS3Client_throws(preconditionFailedError)
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const workflow = buildValidWorkflow()
    const result = await saveWorkflow.save(workflow)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'DuplicateWorkflowError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   ************************************************************
   * Test expected result
   ************************************************************/
  it(`returns the expected Success<void> if the execution path is successful`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const saveWorkflow = new SaveWorkflowClient(mockS3Client)
    const workflow = buildValidWorkflow()
    const result = await saveWorkflow.save(workflow)
    const expectedResult = Result.makeSuccess()
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
