import { z } from 'zod'
import { WorkflowContinuedEventData, WorkflowContinuedEventDefinition } from './WorkflowContinuedEvent'

function buildTestInputData(): WorkflowContinuedEventData {
  return {
    workflowId: 'mockWorkflowId',
    continued: true,
  }
}

describe(`Test WorkflowContinuedEvent`, () => {
  /***
   * Test parseValidate
   */
  describe(`Test parseValidate`, () => {
    it(`correctly parses and returns a completely valid data object`, () => {
      const testData = buildTestInputData()
      const parsedData = WorkflowContinuedEventDefinition.parseValidate(testData)
      expect(parsedData).toStrictEqual(testData)
    })

    /***
     * Test WorkflowContinuedEventData.workflowId
     */
    describe(`Test WorkflowContinuedEventData.workflowId`, () => {
      it(`throws if WorkflowContinuedEventData.workflowId is undefined`, () => {
        const testData = buildTestInputData()
        testData.workflowId = undefined as unknown as string
        const testingFunc = () => WorkflowContinuedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowContinuedEventData.workflowId is an empty string`, () => {
        const testData = buildTestInputData()
        testData.workflowId = ''
        const testingFunc = () => WorkflowContinuedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowContinuedEventData.continued
     */
    describe(`Test WorkflowContinuedEventData.continued`, () => {
      it(`throws if WorkflowContinuedEventData.continued is undefined`, () => {
        const testData = buildTestInputData()
        testData.continued = undefined as unknown as true
        const testingFunc = () => WorkflowContinuedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowContinuedEventData.continued is false`, () => {
        const testData = buildTestInputData()
        testData.continued = false as unknown as true
        const testingFunc = () => WorkflowContinuedEventDefinition.parseValidate(testData)
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
      const expectedKey = `workflowId:${testData.workflowId}:continued:${testData.continued}`
      const generatedKey = WorkflowContinuedEventDefinition.generateIdempotencyKey(testData)
      expect(generatedKey).toBe(expectedKey)
    })
  })
})
