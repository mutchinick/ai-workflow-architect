import KSUID from 'ksuid'
import { Result } from '../../errors/Result'
import { Workflow, WorkflowInput, WorkflowProps } from './Workflow'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

// const mockDate = new Date().toISOString()
const mockWorkflowId = 'mockWorkflowId'
const mockQuery = 'mockQuery'
const mockEnhancePromptRounds = 3
const mockEnhanceResultRounds = 2

function buildMockWorkflowInput(): WorkflowInput {
  const mockValidWorkflowProps: WorkflowInput = {
    query: mockQuery,
    enhancePromptRounds: mockEnhancePromptRounds,
    enhanceResultRounds: mockEnhanceResultRounds,
  }
  return mockValidWorkflowProps
}

function buildMockWorkflowProps(): WorkflowProps {
  const mockValidWorkflowProps: WorkflowProps = {
    workflowId: mockWorkflowId,
    input: {
      query: mockQuery,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    },
    steps: [],
  }
  return mockValidWorkflowProps
}

describe(`Workflow Service SendQueryApi WorkflowProps tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test Workflow.fromInput
   ************************************************************/
  describe(`Test Workflow.fromInput`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowInput edge cases
     ************************************************************/
    it(`does not return a Failure if the input WorkflowInput is valid`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput is undefined`, () => {
      const mockWorkflowInput = undefined as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput is null`, () => {
      const mockWorkflowInput = null as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowInput.query edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.query is undefined`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.query = undefined as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.query is null`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.query = null as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.query is empty`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.query = '' as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.query is blank`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.query = '      ' as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.query length < 6`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.query = '12345' as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowInput.enhancePromptRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhancePromptRounds is undefined`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhancePromptRounds = undefined as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhancePromptRounds is null`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhancePromptRounds = null as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhancePromptRounds is < 1`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhancePromptRounds = 0 as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhancePromptRounds is > 10`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhancePromptRounds = 11 as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhancePromptRounds is not an integer`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhancePromptRounds = 3.45 as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhancePromptRounds is not an number`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhancePromptRounds = '3' as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowInput.enhanceResultRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhanceResultRounds is undefined`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhanceResultRounds = undefined as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhanceResultRounds is null`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhanceResultRounds = null as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhanceResultRounds is < 1`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhanceResultRounds = 0 as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhanceResultRounds is > 10`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhanceResultRounds = 11 as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhanceResultRounds is not an integer`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhanceResultRounds = 3.45 as never
      const result = Workflow.fromInput(mockWorkflowInput)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInput.enhanceResultRounds is not an number`, () => {
      const mockWorkflowInput = buildMockWorkflowInput()
      mockWorkflowInput.enhanceResultRounds = '3' as never
      const result = Workflow.fromInput(mockWorkflowInput)
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
    it(`returns the expected Success<WorkflowInput> if the execution path is successful`, () => {
      // Mock KSUID to return a fixed workflowId
      jest.spyOn(KSUID, 'randomSync').mockReturnValue({
        string: mockWorkflowId,
      } as never)

      const mockWorkflowInput = buildMockWorkflowInput()
      const result = Workflow.fromInput(mockWorkflowInput)
      const expectedWorkflow: WorkflowProps = {
        workflowId: mockWorkflowId,
        input: {
          query: mockWorkflowInput.query,
          enhancePromptRounds: mockWorkflowInput.enhancePromptRounds,
          enhanceResultRounds: mockWorkflowInput.enhanceResultRounds,
        },
        steps: [],
      }
      Object.setPrototypeOf(expectedWorkflow, Workflow.prototype)
      const expectedResult = Result.makeSuccess(expectedWorkflow)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test Workflow.fromProps
   ************************************************************/
  describe(`Test Workflow.fromProps`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowProps edge cases
     ************************************************************/
    it(`does not return a Failure if the input WorkflowProps is valid`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps is undefined`, () => {
      const mockWorkflowProps = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps is null`, () => {
      const mockWorkflowProps = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowProps.workflowId edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.workflowId is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.workflowId = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.workflowId is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.workflowId = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.workflowId is empty`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.workflowId = '' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.workflowId is blank`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.workflowId = '      ' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.workflowId length < 6`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.workflowId = '12345' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowProps.input edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowProps.input.query edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.query is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.query = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.query is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.query = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.query is empty`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.query = '' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.query is blank`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.query = '      ' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.query length < 6`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.query = '12345' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowProps.input.enhancePromptRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhancePromptRounds is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhancePromptRounds = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhancePromptRounds is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhancePromptRounds = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhancePromptRounds is < 1`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhancePromptRounds = 0 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhancePromptRounds is > 10`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhancePromptRounds = 11 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhancePromptRounds is not an integer`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhancePromptRounds = 3.45 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhancePromptRounds is not an number`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhancePromptRounds = '3' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowProps.input.enhanceResultRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhanceResultRounds is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhanceResultRounds = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhanceResultRounds is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhanceResultRounds = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhanceResultRounds is < 1`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhanceResultRounds = 0 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhanceResultRounds is > 10`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhanceResultRounds = 11 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhanceResultRounds is not an integer`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhanceResultRounds = 3.45 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.input.enhanceResultRounds is not an number`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.input.enhanceResultRounds = '3' as never
      const result = Workflow.fromProps(mockWorkflowProps)
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
    it(`returns the expected Success<WorkflowProps> if the execution path is successful`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      const result = Workflow.fromProps(mockWorkflowProps)
      const expectedWorkflow: WorkflowProps = {
        workflowId: mockWorkflowProps.workflowId,
        input: {
          query: mockWorkflowProps.input.query,
          enhancePromptRounds: mockWorkflowProps.input.enhancePromptRounds,
          enhanceResultRounds: mockWorkflowProps.input.enhanceResultRounds,
        },
        steps: mockWorkflowProps.steps,
      }
      Object.setPrototypeOf(expectedWorkflow, Workflow.prototype)
      const expectedResult = Result.makeSuccess(expectedWorkflow)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test Workflow.fromProps
   ************************************************************/
  describe(`Test Workflow.toJSON`, () => {
    /*
     *
     *
     ************************************************************
     * Test expected results
     ************************************************************/
    it(`returns the expected WorkflowProps if the execution path is successful`, () => {
      const props = buildMockWorkflowProps()
      const result = Workflow.fromProps(props)
      const workflow = Result.getSuccessValueOrThrow(result)
      expect(workflow.toJSON()).toStrictEqual(props)
    })
  })
})
