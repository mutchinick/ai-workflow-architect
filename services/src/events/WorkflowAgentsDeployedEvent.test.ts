import { z } from 'zod'
import { WorkflowAgentsDeployedEventData, WorkflowAgentsDeployedEventDefinition } from './WorkflowAgentsDeployedEvent'

function buildTestInputData(): WorkflowAgentsDeployedEventData {
  return {
    workflowId: 'wf-12345',
    objectKey: 'prompts/input.txt',
  }
}

describe('Test WorkflowAgentsDeployedEvent', () => {
  /***
   * Test parseValidate
   */
  describe('Test parseValidate', () => {
    it('correctly parses and returns a completely valid data object', () => {
      const testData = buildTestInputData()
      const parsedData = WorkflowAgentsDeployedEventDefinition.parseValidate(testData)
      expect(parsedData).toStrictEqual(testData)
    })

    /***
     * Test WorkflowAgentsDeployedEventData.workflowId
     */
    describe('Test WorkflowAgentsDeployedEventData.workflowId', () => {
      it('throws if WorkflowAgentsDeployedEventData.workflowId is undefined', () => {
        const testData = buildTestInputData()
        testData.workflowId = undefined as unknown as string
        const testingFunc = () => WorkflowAgentsDeployedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowAgentsDeployedEventData.workflowId is an empty string', () => {
        const testData = buildTestInputData()
        testData.workflowId = ''
        const testingFunc = () => WorkflowAgentsDeployedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowAgentsDeployedEventData.workflowId is not a string', () => {
        const testData = buildTestInputData()
        testData.workflowId = 12345 as unknown as string
        const testingFunc = () => WorkflowAgentsDeployedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })
    })

    /***
     * Test WorkflowAgentsDeployedEventData.objectKey
     */
    describe('Test WorkflowAgentsDeployedEventData.objectKey', () => {
      it('throws if WorkflowAgentsDeployedEventData.objectKey is undefined', () => {
        const testData = buildTestInputData()
        testData.objectKey = undefined as unknown as string
        const testingFunc = () => WorkflowAgentsDeployedEventDefinition.parseValidate(testData)
        expect(testingFunc).toThrow(z.ZodError)
      })

      it('throws if WorkflowAgentsDeployedEventData.objectKey is an empty string', () => {
        const testData = buildTestInputData()
        testData.objectKey = ''
        const testingFunc = () => WorkflowAgentsDeployedEventDefinition.parseValidate(testData)
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
      const generatedKey = WorkflowAgentsDeployedEventDefinition.generateIdempotencyKey(testData)
      expect(generatedKey).toBe(expectedKey)
    })
  })
})
