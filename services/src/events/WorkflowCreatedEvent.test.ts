import { z } from 'zod'
import { WorkflowCreatedEventData, WorkflowCreatedEventDefinition } from './WorkflowCreatedEvent'

function buildTestInputData(): WorkflowCreatedEventData {
  return {
    workflowId: 'wf-abc-123',
    promptEnhancementRounds: 5,
    responseEnhancementRounds: 3,
    objectKey: 'workflows/my-workflow.json',
  }
}

describe(`Test WorkflowCreatedEvent`, () => {
  /***
   * Test parseValidate
   */
  describe(`Test parseValidate`, () => {
    it(`correctly parses and returns a completely valid data object`, () => {
      const testData = buildTestInputData()
      const parsedData = WorkflowCreatedEventDefinition.parseValidate(testData)
      expect(parsedData).toStrictEqual(testData)
    })

    /***
     * Test WorkflowCreatedEventData.workflowId
     */
    describe(`Test WorkflowCreatedEventData.workflowId`, () => {
      it(`throws if WorkflowCreatedEventData.workflowId is undefined`, () => {
        const testData = buildTestInputData()
        testData.workflowId = undefined as unknown as string
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowCreatedEventData.workflowId is an empty string`, () => {
        const testData = buildTestInputData()
        testData.workflowId = ''
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowCreatedEventData.promptEnhancementRounds
     */
    describe(`Test WorkflowCreatedEventData.promptEnhancementRounds`, () => {
      it(`throws if WorkflowCreatedEventData.promptEnhancementRounds is undefined`, () => {
        const testData = buildTestInputData()
        testData.promptEnhancementRounds = undefined as unknown as number
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowCreatedEventData.promptEnhancementRounds is less than 1`, () => {
        const testData = buildTestInputData()
        testData.promptEnhancementRounds = 0
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowCreatedEventData.promptEnhancementRounds is greater than 10`, () => {
        const testData = buildTestInputData()
        testData.promptEnhancementRounds = 11
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowCreatedEventData.promptEnhancementRounds is not an integer`, () => {
        const testData = buildTestInputData()
        testData.promptEnhancementRounds = 1.5
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowCreatedEventData.responseEnhancementRounds
     */
    describe(`Test WorkflowCreatedEventData.responseEnhancementRounds`, () => {
      it(`throws if WorkflowCreatedEventData.responseEnhancementRounds is undefined`, () => {
        const testData = buildTestInputData()
        testData.responseEnhancementRounds = undefined as unknown as number
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowCreatedEventData.responseEnhancementRounds is less than 1`, () => {
        const testData = buildTestInputData()
        testData.responseEnhancementRounds = 0
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowCreatedEventData.responseEnhancementRounds is greater than 10`, () => {
        const testData = buildTestInputData()
        testData.responseEnhancementRounds = 11
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowCreatedEventData.objectKey
     */
    describe(`Test WorkflowCreatedEventData.objectKey`, () => {
      it(`throws if WorkflowCreatedEventData.objectKey is undefined`, () => {
        const testData = buildTestInputData()
        testData.objectKey = undefined as unknown as string
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it(`throws if WorkflowCreatedEventData.objectKey is an empty string`, () => {
        const testData = buildTestInputData()
        testData.objectKey = ''
        const testingFunc = () => WorkflowCreatedEventDefinition.parseValidate(testData)
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
      const expectedKey = `workflowId:${testData.workflowId}:objectKey:${testData.objectKey}`
      const generatedKey = WorkflowCreatedEventDefinition.generateIdempotencyKey(testData)
      expect(generatedKey).toBe(expectedKey)
    })
  })
})
