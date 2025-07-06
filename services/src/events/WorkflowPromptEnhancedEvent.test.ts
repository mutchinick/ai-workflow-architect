import { z } from 'zod'
import { WorkflowPromptEnhancedEventData, WorkflowPromptEnhancedEventDefinition } from './WorkflowPromptEnhancedEvent'

function buildTestInputData(): WorkflowPromptEnhancedEventData {
  return {
    workflowId: 'wf-12345',
    objectKey: 'prompts/input.txt',
    agentId: 'agent-007',
    round: 1,
  }
}

describe('Test WorkflowPromptEnhancedEvent', () => {
  /***
   * Test parseValidate
   */
  describe('Test parseValidate', () => {
    it('correctly parses and returns a completely valid data object', () => {
      const testData = buildTestInputData()
      const parsedData = WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
      expect(parsedData).toStrictEqual(testData)
    })

    /***
     * Test WorkflowPromptEnhancedEventData.workflowId
     */
    describe('Test WorkflowPromptEnhancedEventData.workflowId', () => {
      it('throws if WorkflowPromptEnhancedEventData.workflowId is undefined', () => {
        const testData = buildTestInputData()
        testData.workflowId = undefined as unknown as string
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptEnhancedEventData.workflowId is an empty string', () => {
        const testData = buildTestInputData()
        testData.workflowId = ''
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptEnhancedEventData.workflowId is not a string', () => {
        const testData = buildTestInputData()
        testData.workflowId = 12345 as unknown as string
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowPromptEnhancedEventData.objectKey
     */
    describe('Test WorkflowPromptEnhancedEventData.objectKey', () => {
      it('throws if WorkflowPromptEnhancedEventData.objectKey is undefined', () => {
        const testData = buildTestInputData()
        testData.objectKey = undefined as unknown as string
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptEnhancedEventData.objectKey is an empty string', () => {
        const testData = buildTestInputData()
        testData.objectKey = ''
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowPromptEnhancedEventData.round
     */
    describe('Test WorkflowPromptEnhancedEventData.agentId', () => {
      it('throws if WorkflowPromptEnhancedEventData.agentId is undefined', () => {
        const testData = buildTestInputData()
        testData.agentId = undefined as unknown as string
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptEnhancedEventData.agentId is an empty string', () => {
        const testData = buildTestInputData()
        testData.agentId = ''
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowPromptEnhancedEventData.round
     */
    describe('Test WorkflowPromptEnhancedEventData.round', () => {
      it('throws if WorkflowPromptEnhancedEventData.round is undefined', () => {
        const testData = buildTestInputData()
        testData.round = undefined as unknown as number
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptEnhancedEventData.round is not a number', () => {
        const testData = buildTestInputData()
        testData.round = 'one' as unknown as number
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptEnhancedEventData.round is not an integer', () => {
        const testData = buildTestInputData()
        testData.round = 1.5 as unknown as number
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowPromptEnhancedEventData.round is less than 0', () => {
        const testData = buildTestInputData()
        testData.round = -1 as unknown as number
        const testingFunc = () => WorkflowPromptEnhancedEventDefinition.parseValidate(testData)
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
      const generatedKey = WorkflowPromptEnhancedEventDefinition.generateIdempotencyKey(testData)
      expect(generatedKey).toBe(expectedKey)
    })
  })
})
