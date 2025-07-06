import { z } from 'zod'
import {
  WorkflowPromptCompletedEventData,
  WorkflowPromptCompletedEventDefinition,
} from './WorkflowPromptCompletedEvent'

function buildTestInputData(): WorkflowPromptCompletedEventData {
  return {
    workflowId: 'wf-12345',
    objectKey: 'prompts/input.txt',
  }
}

describe('Test WorkflowPromptCompletedEvent', () => {
  /***
   * Test parseValidate
   */
  describe('Test parseValidate', () => {
    it('correctly parses and returns a completely valid data object', () => {
      const testData = buildTestInputData()
      const parsedData = WorkflowPromptCompletedEventDefinition.parseValidate(testData)
      expect(parsedData).toStrictEqual(testData)
    })

    /***
     * Test WorkflowPromptCompletedEventData.workflowId
     */
    describe('Test WorkflowPromptCompletedEventData.workflowId', () => {
      it('throws if WorkflowPromptCompletedEventData.workflowId is undefined', () => {
        const testData = buildTestInputData()
        testData.workflowId = undefined as unknown as string
        const testingFunc = () => WorkflowPromptCompletedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptCompletedEventData.workflowId is an empty string', () => {
        const testData = buildTestInputData()
        testData.workflowId = ''
        const testingFunc = () => WorkflowPromptCompletedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptCompletedEventData.workflowId is not a string', () => {
        const testData = buildTestInputData()
        testData.workflowId = 12345 as unknown as string
        const testingFunc = () => WorkflowPromptCompletedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowPromptCompletedEventData.objectKey
     */
    describe('Test WorkflowPromptCompletedEventData.objectKey', () => {
      it('throws if WorkflowPromptCompletedEventData.objectKey is undefined', () => {
        const testData = buildTestInputData()
        testData.objectKey = undefined as unknown as string
        const testingFunc = () => WorkflowPromptCompletedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptCompletedEventData.objectKey is an empty string', () => {
        const testData = buildTestInputData()
        testData.objectKey = ''
        const testingFunc = () => WorkflowPromptCompletedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })
  })

  /***
   * Test generateIdempotencyKey
   */
  describe('Test generateIdempotencyKey', () => {
    it('generates a deterministic key based on the workflowId', () => {
      const testData = buildTestInputData()
      const expectedKey = `workflowId:${testData.workflowId}:objectKey:${testData.objectKey}`
      const generatedKey = WorkflowPromptCompletedEventDefinition.generateIdempotencyKey(testData)
      expect(generatedKey).toBe(expectedKey)
    })
  })
})
