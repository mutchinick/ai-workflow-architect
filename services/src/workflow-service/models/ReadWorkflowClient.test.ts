import { S3Client, S3ServiceException } from '@aws-sdk/client-s3'
import { Result } from '../../errors/Result'
import { ReadWorkflowClient } from './ReadWorkflowClient'
import { Workflow, WorkflowProps } from './Workflow'

/*
 *
 *
 ************************************************************
 * Mock setup
 ************************************************************/
const mockBucket = 'mockWorkflowBucket'
process.env.WORKFLOW_SERVICE_BUCKET_NAME = mockBucket

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockWorkflowId = 'mockWorkflowId'
const mockObjectKey = `${mockWorkflowId}-object-key`
const mockQuery = 'mockQuery'
const mockEnhancePromptRounds = 3
const mockEnhanceResultRounds = 2

function buildMockWorkflowProps(): WorkflowProps {
  return {
    workflowId: mockWorkflowId,
    instructions: {
      query: mockQuery,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    },
    steps: [],
  }
}

function buildValidWorkflow(): Workflow {
  const props = buildMockWorkflowProps()
  const workflowResult = Workflow.fromProps(props)
  const workflow = Result.getSuccessValueOrThrow(workflowResult)
  return workflow
}

function buildMockS3Client_resolves(value?: string): S3Client {
  const readWorkflow = buildValidWorkflow()
  const readWorkflowSerialized = JSON.stringify(readWorkflow)
  return {
    send: jest.fn().mockResolvedValue({
      Body: {
        transformToString: jest.fn().mockResolvedValue(value ?? readWorkflowSerialized),
      },
    }),
  } as unknown as S3Client
}

function buildMockS3Client_throws(error?: unknown): S3Client {
  return { send: jest.fn().mockRejectedValue(error ?? new Error('Unknown')) } as unknown as S3Client
}

/*
 *
 *
 ************************************************************
 * ReadWorkflowClient tests
 ************************************************************/
describe(`Workflow ReadWorkflowClient tests`, () => {
  beforeEach(() => {
    process.env.WORKFLOW_SERVICE_BUCKET_NAME = mockBucket
  })

  /*
   *
   ************************************************************
   * Test objectKey edge cases
   ************************************************************/
  it(`does not return a Failure if the input objectKey is valid`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const result = await readWorkflowClient.read(mockObjectKey)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      objectKey is undefined`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const objectKey = undefined as never
    const result = await readWorkflowClient.read(objectKey)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      objectKey is null`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const objectKey = null as never
    const result = await readWorkflowClient.read(objectKey)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      objectKey is an empty string`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const objectKey = '' as never
    const result = await readWorkflowClient.read(objectKey)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the env var
      process.env.WORKFLOW_SERVICE_BUCKET_NAME is empty`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    process.env.WORKFLOW_SERVICE_BUCKET_NAME = ''
    const result = await readWorkflowClient.read(mockObjectKey)
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
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    await readWorkflowClient.read(mockObjectKey)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockS3Client.send).toHaveBeenCalledTimes(1)
  })

  it(`calls S3Client.send with a PutObjectCommand and expected input`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    await readWorkflowClient.read(mockObjectKey)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockS3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: mockBucket,
          Key: mockObjectKey,
        },
      }),
    )
  })

  it(`returns a transient Failure of kind WorkflowFileCorruptedError if S3Client.send
      returns an invalid Workflow file`, async () => {
    const mockS3Client = buildMockS3Client_resolves('{"invalid": "data"}')
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const result = await readWorkflowClient.read(mockObjectKey)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowFileCorruptedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a transient Failure of kind WorkflowFileCorruptedError if S3Client.send
      returns and empty string`, async () => {
    const mockS3Client = buildMockS3Client_resolves('')
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const result = await readWorkflowClient.read(mockObjectKey)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowFileCorruptedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a transient Failure of kind UnrecognizedError if S3Client.send throws an
      unrecognized error`, async () => {
    const mockS3Client = buildMockS3Client_throws()
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const result = await readWorkflowClient.read(mockObjectKey)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind WorkflowFileNotFoundError if
      S3Client.send throws a NoSuckKey error`, async () => {
    const preconditionFailedError = new S3ServiceException({
      name: 'NoSuchKey',
      $fault: 'server',
      $metadata: {},
    })
    const mockS3Client = buildMockS3Client_throws(preconditionFailedError)
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const result = await readWorkflowClient.read(mockObjectKey)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowFileNotFoundError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   ************************************************************
   * Test expected result
   ************************************************************/
  it(`returns the expected Success<void> if the execution path is successful`, async () => {
    const mockS3Client = buildMockS3Client_resolves()
    const readWorkflowClient = new ReadWorkflowClient(mockS3Client)
    const result = await readWorkflowClient.read(mockObjectKey)
    const expectedWorkflow = buildValidWorkflow()
    const expectedResult = Result.makeSuccess(expectedWorkflow)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
