import { z } from 'zod'
import { WorkflowStartedEventData, WorkflowStartedEventDefinition } from './WorkflowStartedEvent'

function buildTestInputData(): WorkflowStartedEventData {
  return {
    workflowId: 'mockWorkflowId',
    started: true,
  }
}

describe(`Test WorkflowStartedEvent`, () => {
  /***
   * Test parseValidate
   */
  describe(`Test parseValidate`, () => {
    it(`correctly parses and returns a completely valid data object`, () => {
      const testData = buildTestInputData()
      const parsedData = WorkflowStartedEventDefinition.parseValidate(testData)
      expect(parsedData).toStrictEqual(testData)
    })

    /***
     * Test WorkflowStartedEventData.workflowId
     */
    describe(`Test WorkflowStartedEventData.workflowId`, () => {
      it(`throws if WorkflowStartedEventData.workflowId is undefined`, () => {
        const testData = buildTestInputData()
        testData.workflowId = undefined as unknown as string
        const testingFunc = () => WorkflowStartedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowStartedEventData.workflowId is an empty string`, () => {
        const testData = buildTestInputData()
        testData.workflowId = ''
        const testingFunc = () => WorkflowStartedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowStartedEventData.started
     */
    describe(`Test WorkflowStartedEventData.started`, () => {
      it(`throws if WorkflowStartedEventData.started is undefined`, () => {
        const testData = buildTestInputData()
        testData.started = undefined as unknown as true
        const testingFunc = () => WorkflowStartedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowStartedEventData.started is false`, () => {
        const testData = buildTestInputData()
        testData.started = false as unknown as true
        const testingFunc = () => WorkflowStartedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })
  })

  /***
   * Test generateIdempotencyKey
   */
  describe(`Test generateIdempotencyKey`, () => {
    it(`generates a deterministic key based on workflowId and objectKey`, () => {
      const testData = buildTestInputData()
      const expectedKey = `workflowId:${testData.workflowId}:started:${testData.started}`
      const generatedKey = WorkflowStartedEventDefinition.generateIdempotencyKey(testData)
      expect(generatedKey).toBe(expectedKey)
    })
  })
})
