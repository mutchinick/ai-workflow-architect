import { GetObjectCommand, ListObjectsV2Command, S3Client, S3ServiceException } from '@aws-sdk/client-s3'
import { Result } from '../../errors/Result'
import { ReadLatestWorkflowClient } from './ReadLatestWorkflowClient'
import { Workflow, WorkflowProps } from './Workflow'

const mockBucket = 'mockWorkflowBucket'
process.env.WORKFLOW_SERVICE_BUCKET_NAME = mockBucket

const mockWorkflowId = 'mockWorkflowId'
const mockPrefix = `workflows/${mockWorkflowId}/`
const mockObjectKey1 = `${mockPrefix}2024-08-01T10:00:00Z-step1.json`
const mockObjectKey2 = `${mockPrefix}2024-08-01T10:05:00Z-step2.json`
const mockLatestObjectKey = mockObjectKey2

function buildMockWorkflowProps(): WorkflowProps {
  return {
    workflowId: mockWorkflowId,
    instructions: {
      query: 'mockQuery',
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

function buildMockS3Client(options: {
  listObjects?: { succeeds: boolean; content?: unknown[]; error?: Error }
  getObject?: { succeeds: boolean; content?: string; error?: Error }
}): S3Client {
  const validWorkflowSerialized = JSON.stringify(buildValidWorkflow())

  return {
    send: jest.fn().mockImplementation((command) => {
      // When the command is ListObjectsV2Command
      if (command instanceof ListObjectsV2Command) {
        if (options.listObjects?.succeeds) {
          return Promise.resolve({
            Contents: options.listObjects.content ?? [
              { Key: mockObjectKey1, LastModified: new Date('2024-08-01T10:00:00Z') },
              { Key: mockLatestObjectKey, LastModified: new Date('2024-08-01T10:05:00Z') },
            ],
          })
        }
        return Promise.reject(options.listObjects?.error ?? new Error('ListObjectsV2Command failed'))
      }

      // When the command is GetObjectCommand
      if (command instanceof GetObjectCommand) {
        if (options.getObject?.succeeds) {
          return Promise.resolve({
            Body: {
              transformToString: jest.fn().mockResolvedValue(options.getObject.content ?? validWorkflowSerialized),
            },
          })
        }
        return Promise.reject(options.getObject?.error ?? new Error('GetObjectCommand failed'))
      }

      return Promise.reject(new Error(`Unknown command type in mock: ${command.constructor.name}`))
    }),
  } as unknown as S3Client
}

/*
 *
 *
 ************************************************************
 * ReadLatestWorkflowClient tests
 ************************************************************/
describe(`Workflow ReadLatestWorkflowClient tests`, () => {
  beforeEach(() => {
    process.env.WORKFLOW_SERVICE_BUCKET_NAME = mockBucket
  })

  /*
   *
   ************************************************************
   * Test prefix edge cases
   ************************************************************/
  it(`does not return a Failure if the input prefix is valid`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: true },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      prefix is undefined`, async () => {
    const mockS3Client = buildMockS3Client({})
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const prefix = undefined as never
    const result = await readLatestWorkflowClient.readLatest(prefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
      prefix is null`, async () => {
    const mockS3Client = buildMockS3Client({})
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const prefix = null as never
    const result = await readLatestWorkflowClient.readLatest(prefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind InvalidArgumentsError if the env var
      process.env.WORKFLOW_SERVICE_BUCKET_NAME is empty`, async () => {
    const mockS3Client = buildMockS3Client({})
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    process.env.WORKFLOW_SERVICE_BUCKET_NAME = ''
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   ************************************************************
   * Test internal logic
   ************************************************************/
  it(`calls S3Client.send twice on the happy path`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: true },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    await readLatestWorkflowClient.readLatest(mockPrefix)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockS3Client.send).toHaveBeenCalledTimes(2)
  })

  it(`calls S3Client.send first with a ListObjectsV2Command`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: true },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    await readLatestWorkflowClient.readLatest(mockPrefix)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockS3Client.send).toHaveBeenNthCalledWith(1, expect.any(ListObjectsV2Command))
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockS3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: mockBucket,
          Prefix: mockPrefix,
        },
      }),
    )
  })

  it(`calls S3Client.send second with a GetObjectCommand using the latest key`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: true },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    await readLatestWorkflowClient.readLatest(mockPrefix)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockS3Client.send).toHaveBeenNthCalledWith(2, expect.any(GetObjectCommand))
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockS3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: mockBucket,
          Key: mockLatestObjectKey,
        },
      }),
    )
  })

  it(`returns a non-transient Failure of kind WorkflowFileNotFoundError if S3 list
      returns no items`, async () => {
    const mockS3Client = buildMockS3Client({ listObjects: { succeeds: true, content: [] } })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowFileNotFoundError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind WorkflowFileNotFoundError if the latest
      S3 object has no key`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true, content: [{ LastModified: new Date() }] },
    }) // No Key property
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowFileNotFoundError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind WorkflowFileCorruptedError if GetObject
      returns invalid Workflow data`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: true, content: '{"mockInvalidValue": ""}' },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowFileCorruptedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a non-transient Failure of kind WorkflowFileCorruptedError if GetObject
      returns an empty string`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: true, content: '' },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowFileCorruptedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  it(`returns a transient Failure of kind UnrecognizedError if ListObjectsV2Command
      fails`, async () => {
    const mockS3Client = buildMockS3Client({ listObjects: { succeeds: false } })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a transient Failure of kind UnrecognizedError if GetObjectCommand fails`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: false },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'UnrecognizedError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(true)
  })

  it(`returns a non-transient Failure of kind WorkflowFileNotFoundError if
      GetObjectCommand fails with NoSuchKey`, async () => {
    const noSuchKeyError = new S3ServiceException({
      name: 'NoSuchKey',
      $fault: 'client',
      $metadata: {},
    })
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: false, error: noSuchKeyError },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    expect(Result.isFailure(result)).toBe(true)
    expect(Result.isFailureOfKind(result, 'WorkflowFileNotFoundError')).toBe(true)
    expect(Result.isFailureTransient(result)).toBe(false)
  })

  /*
   *
   ************************************************************
   * Test expected result
   ************************************************************/
  it(`returns the expected Success<Workflow> if the execution path is successful`, async () => {
    const mockS3Client = buildMockS3Client({
      listObjects: { succeeds: true },
      getObject: { succeeds: true },
    })
    const readLatestWorkflowClient = new ReadLatestWorkflowClient(mockS3Client)
    const result = await readLatestWorkflowClient.readLatest(mockPrefix)
    const expectedWorkflow = buildValidWorkflow()
    const expectedResult = Result.makeSuccess(expectedWorkflow)
    expect(Result.isSuccess(result)).toBe(true)
    expect(result).toStrictEqual(expectedResult)
  })
})
