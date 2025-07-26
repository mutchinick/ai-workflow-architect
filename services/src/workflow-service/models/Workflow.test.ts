import KSUID from 'ksuid'
import { Result } from '../../errors/Result'
import { Workflow, WorkflowInstructions, WorkflowProps } from './Workflow'
import {
  firstResponder,
  multiAgents,
  multiAgentScenario,
  preexistingStepsScenario,
  singleAgent,
  singleAgentScenario,
} from './fixtures/deploy-agents-fixtures'
import {
  maxRoundsExceededInstructions,
  shortQueryInstructions,
  standardValidInstructions,
  zeroRoundsInstructions,
} from './fixtures/from-instructions-fixures'
import {
  emptyWorkflowScenario,
  fullyExecutedScenario,
  initialStepValidScenario,
  invalidIdScenario,
  invalidInstructionsScenario,
  noStepsExecutedScenario,
  partiallyExecutedScenario,
} from './fixtures/from-props-fixtures'

const mockWorkflowId = 'mockWorkflowId'
const mockQuery = 'mockQuery'
const mockEnhancePromptRounds = 3
const mockEnhanceResultRounds = 2

function buildMockWorkflowInstructions(): WorkflowInstructions {
  const mockValidWorkflowProps: WorkflowInstructions = {
    query: mockQuery,
    enhancePromptRounds: mockEnhancePromptRounds,
    enhanceResultRounds: mockEnhanceResultRounds,
  }
  return mockValidWorkflowProps
}

function buildMockWorkflowProps(): WorkflowProps {
  const mockValidWorkflowProps: WorkflowProps = {
    workflowId: mockWorkflowId,
    instructions: {
      query: mockQuery,
      enhancePromptRounds: mockEnhancePromptRounds,
      enhanceResultRounds: mockEnhanceResultRounds,
    },
    steps: [],
  }
  return mockValidWorkflowProps
}

describe(`Workflow Service models Workflow tests`, () => {
  /*
   *
   *
   ************************************************************
   * Test Workflow.fromInstructions
   ************************************************************/
  describe(`Test Workflow.fromInstructions`, () => {
    /*
     *
     *
     ************************************************************
     * Test WorkflowInstructions edge cases
     ************************************************************/
    it(`does not return a Failure if the input WorkflowInstructions is valid`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions is undefined`, () => {
      const mockWorkflowInstructions = undefined as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions is null`, () => {
      const mockWorkflowInstructions = null as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowInstructions.query edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.query is undefined`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.query = undefined as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.query is null`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.query = null as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.query is empty`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.query = '' as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.query is blank`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.query = '      ' as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.query length < 6`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.query = '12345' as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowInstructions.enhancePromptRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhancePromptRounds is undefined`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhancePromptRounds = undefined as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhancePromptRounds is null`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhancePromptRounds = null as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhancePromptRounds is < 1`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhancePromptRounds = 0 as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhancePromptRounds is > 10`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhancePromptRounds = 11 as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhancePromptRounds is not an integer`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhancePromptRounds = 3.45 as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhancePromptRounds is not an number`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhancePromptRounds = '3' as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowInstructions.enhanceResultRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhanceResultRounds is undefined`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhanceResultRounds = undefined as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhanceResultRounds is null`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhanceResultRounds = null as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhanceResultRounds is < 1`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhanceResultRounds = 0 as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhanceResultRounds is > 10`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhanceResultRounds = 11 as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhanceResultRounds is not an integer`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhanceResultRounds = 3.45 as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowInstructions.enhanceResultRounds is not an number`, () => {
      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      mockWorkflowInstructions.enhanceResultRounds = '3' as never
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
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
    it(`returns the expected Success<Workflow> if the execution path is successful`, () => {
      // Mock KSUID to return a fixed workflowId
      jest.spyOn(KSUID, 'randomSync').mockReturnValue({
        string: mockWorkflowId,
      } as never)

      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      const expectedWorkflow: WorkflowProps = {
        workflowId: mockWorkflowId,
        instructions: {
          query: mockWorkflowInstructions.query,
          enhancePromptRounds: mockWorkflowInstructions.enhancePromptRounds,
          enhanceResultRounds: mockWorkflowInstructions.enhanceResultRounds,
        },
        steps: [],
      }
      Object.setPrototypeOf(expectedWorkflow, Workflow.prototype)
      const expectedResult = Result.makeSuccess(expectedWorkflow)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Success<Workflow> for valid instructions`, () => {
      const { instructions } = standardValidInstructions
      const result = Workflow.fromInstructions(instructions)
      expect(Result.isSuccess(result)).toBe(true)
      const workflow = Result.getSuccessValueOrThrow(result)
      expect(workflow.instructions).toStrictEqual(instructions)
      expect(workflow.steps).toEqual([])
      expect(workflow.workflowId).toEqual(expect.any(String))
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError for a short query`, () => {
      const { instructions } = shortQueryInstructions
      const result = Workflow.fromInstructions(instructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError for zero rounds`, () => {
      const { instructions } = zeroRoundsInstructions
      const result = Workflow.fromInstructions(instructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError when rounds exceed
        max`, () => {
      const { instructions } = maxRoundsExceededInstructions
      const result = Workflow.fromInstructions(instructions)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
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
     * Test WorkflowProps.instructions edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowProps.instructions.query edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.query is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.query = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.query is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.query = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.query is empty`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.query = '' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.query is blank`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.query = '      ' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.query length < 6`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.query = '12345' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowProps.instructions.enhancePromptRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhancePromptRounds is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhancePromptRounds = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhancePromptRounds is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhancePromptRounds = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhancePromptRounds is < 1`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhancePromptRounds = 0 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhancePromptRounds is > 10`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhancePromptRounds = 11 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhancePromptRounds is not an integer`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhancePromptRounds = 3.45 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhancePromptRounds is not an number`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhancePromptRounds = '3' as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    /*
     *
     *
     ************************************************************
     * Test WorkflowProps.instructions.enhanceResultRounds edge cases
     ************************************************************/
    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhanceResultRounds is undefined`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhanceResultRounds = undefined as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhanceResultRounds is null`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhanceResultRounds = null as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhanceResultRounds is < 1`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhanceResultRounds = 0 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhanceResultRounds is > 10`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhanceResultRounds = 11 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhanceResultRounds is not an integer`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhanceResultRounds = 3.45 as never
      const result = Workflow.fromProps(mockWorkflowProps)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the input
        WorkflowProps.instructions.enhanceResultRounds is not an number`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      mockWorkflowProps.instructions.enhanceResultRounds = '3' as never
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
    it(`returns the expected Success<Workflow> if the execution path is successful`, () => {
      const mockWorkflowProps = buildMockWorkflowProps()
      const result = Workflow.fromProps(mockWorkflowProps)
      const expectedWorkflow: WorkflowProps = { ...mockWorkflowProps }
      Object.setPrototypeOf(expectedWorkflow, Workflow.prototype)
      const expectedResult = Result.makeSuccess(expectedWorkflow)
      expect(Result.isSuccess(result)).toBe(true)
      expect(result).toStrictEqual(expectedResult)
    })

    it(`returns the expected Success<Workflow> if the input WorkflowProps are valid`, () => {
      const { props } = emptyWorkflowScenario
      const result = Workflow.fromProps(props)
      expect(Result.isSuccess(result)).toBe(true)
      const expectedWorkflow = Object.setPrototypeOf({ ...props }, Workflow.prototype)
      expect(result).toStrictEqual(Result.makeSuccess(expectedWorkflow))
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the if the
        input WorkflowProps.workflowId is empty`, () => {
      const { props } = invalidIdScenario
      const result = Workflow.fromProps(props)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if the if the
        input WorkflowProps.instructions are invalid`, () => {
      const { props } = invalidInstructionsScenario
      const result = Workflow.fromProps(props)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test Workflow.nextStep
   ************************************************************/
  describe(`Test Workflow.nextStep`, () => {
    it(`returns null when no steps are present`, () => {
      const workflowResult = Workflow.fromProps(emptyWorkflowScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.nextStep()).toBeNull()
    })

    it(`returns the first step when no steps have been executed`, () => {
      const workflowResult = Workflow.fromProps(noStepsExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.nextStep()).toMatchObject({ stepId: 'x0001-r001-deploy-agents' })
    })

    it(`returns the first pending step in a partially executed workflow`, () => {
      const workflowResult = Workflow.fromProps(partiallyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.nextStep()).toMatchObject({ stepId: 'x0003-r001-enhance-prompt-Bob' })
    })

    it(`returns null when all steps are completed`, () => {
      const workflowResult = Workflow.fromProps(fullyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.nextStep()).toBeNull()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test Workflow.lastExecutedStep
   ************************************************************/
  describe(`Test Workflow.lastExecutedStep`, () => {
    it(`returns null when no steps are present`, () => {
      const workflowResult = Workflow.fromProps(emptyWorkflowScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.lastExecutedStep()).toBeNull()
    })

    it(`returns null when no steps have been completed`, () => {
      const workflowResult = Workflow.fromProps(noStepsExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.lastExecutedStep()).toBeNull()
    })

    it(`returns the correct step when only the initial step is completed`, () => {
      const workflowResult = Workflow.fromProps(initialStepValidScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.lastExecutedStep()).toMatchObject({ stepId: 'x0001-r001-deploy-agents' })
    })

    it(`returns the last completed step in a partially executed workflow`, () => {
      const workflowResult = Workflow.fromProps(partiallyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.lastExecutedStep()).toMatchObject({ stepId: 'x0002-r001-enhance-prompt-Alice' })
    })

    it(`returns the final step in a fully executed workflow`, () => {
      const workflowResult = Workflow.fromProps(fullyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.lastExecutedStep()).toMatchObject({ stepId: 'x0004-r001-enhance-result-Alice' })
    })
  })

  /*
   *
   *
   ************************************************************
   * Test Workflow.getObjectKey
   ************************************************************/
  describe(`Test Workflow.getObjectKey`, () => {
    it(`returns the correct key format for an empty workflow`, () => {
      const workflowResult = Workflow.fromProps(emptyWorkflowScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const workflowId = emptyWorkflowScenario.props.workflowId
      const baseKey = `workflow-${workflowId}/workflow-${workflowId}`
      const expectedKey = `${baseKey}-x0000-r000-created.json`
      expect(workflow.getObjectKey()).toBe(expectedKey)
    })

    it(`returns the correct key format when no steps have been executed`, () => {
      const workflowResult = Workflow.fromProps(noStepsExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const workflowId = noStepsExecutedScenario.props.workflowId
      const baseKey = `workflow-${workflowId}/workflow-${workflowId}`
      const expectedKey = `${baseKey}-x0000-r000-created.json`
      expect(workflow.getObjectKey()).toBe(expectedKey)
    })

    it(`returns the correct key format for a partially executed workflow`, () => {
      const workflowResult = Workflow.fromProps(partiallyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const workflowId = partiallyExecutedScenario.props.workflowId
      const baseKey = `workflow-${workflowId}/workflow-${workflowId}`
      const expectedKey = `${baseKey}-x0002-r001-enhance-prompt-Alice.json`
      expect(workflow.getObjectKey()).toBe(expectedKey)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test Workflow.deployAgents
   ************************************************************/
  describe(`Workflow.deployAgents`, () => {
    it(`generates the correct final state for a single agent`, () => {
      const workflowResult = Workflow.fromInstructions(singleAgentScenario.instructions)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const mockResult = 'Test Result'
      const mockPrompt = 'Test Prompt'
      workflow.deployAgents(mockPrompt, mockResult, singleAgentScenario.agents, firstResponder)
      const expectedProps: WorkflowProps = {
        workflowId: workflow.workflowId,
        instructions: singleAgentScenario.instructions,
        steps: [
          {
            stepId: 'x0001-r001-deploy-agents',
            stepStatus: 'completed',
            executionOrder: 1,
            round: 1,
            stepType: 'deploy_agents',
            prompt: mockPrompt,
            result: mockResult,
            agents: singleAgent,
          },
          {
            stepId: 'x0002-r001-enhance-prompt-Copernicus',
            stepStatus: 'pending',
            executionOrder: 2,
            round: 1,
            stepType: 'enhance_prompt',
            agent: singleAgent[0],
            prompt: '',
            result: '',
          },
          {
            stepId: 'x0003-r001-respond-prompt-First-Responder',
            stepStatus: 'pending',
            executionOrder: 3,
            round: 1,
            stepType: 'respond_prompt',
            agent: firstResponder,
            prompt: '',
            result: '',
          },
          {
            stepId: 'x0004-r001-enhance-result-Copernicus',
            stepStatus: 'pending',
            executionOrder: 4,
            round: 1,
            stepType: 'enhance_result',
            agent: singleAgent[0],
            prompt: '',
            result: '',
          },
        ],
      }
      expect(workflow.toJSON()).toStrictEqual(expectedProps)
    })

    it(`generates the correct final state for multiple agents and rounds`, () => {
      const workflowResult = Workflow.fromInstructions(multiAgentScenario.instructions)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const mockResult = 'Test Result'
      const mockPrompt = 'Test Prompt'
      workflow.deployAgents(mockPrompt, mockResult, multiAgentScenario.agents, firstResponder)
      const expectedProps: WorkflowProps = {
        workflowId: workflow.workflowId,
        instructions: multiAgentScenario.instructions,
        steps: [
          {
            stepId: 'x0001-r001-deploy-agents',
            stepStatus: 'completed',
            executionOrder: 1,
            round: 1,
            stepType: 'deploy_agents',
            prompt: mockPrompt,
            result: mockResult,
            agents: multiAgents,
          },
          {
            stepId: 'x0002-r001-enhance-prompt-Architect',
            stepStatus: 'pending',
            executionOrder: 2,
            round: 1,
            stepType: 'enhance_prompt',
            agent: multiAgents[0],
            prompt: '',
            result: '',
          },
          {
            stepId: 'x0003-r001-enhance-prompt-Critic',
            stepStatus: 'pending',
            executionOrder: 3,
            round: 1,
            stepType: 'enhance_prompt',
            agent: multiAgents[1],
            prompt: '',
            result: '',
          },
          {
            stepId: 'x0004-r002-enhance-prompt-Architect',
            stepStatus: 'pending',
            executionOrder: 4,
            round: 2,
            stepType: 'enhance_prompt',
            agent: multiAgents[0],
            prompt: '',
            result: '',
          },
          {
            stepId: 'x0005-r002-enhance-prompt-Critic',
            stepStatus: 'pending',
            executionOrder: 5,
            round: 2,
            stepType: 'enhance_prompt',
            agent: multiAgents[1],
            prompt: '',
            result: '',
          },
          {
            stepId: 'x0006-r001-respond-prompt-First-Responder',
            stepStatus: 'pending',
            executionOrder: 6,
            round: 1,
            stepType: 'respond_prompt',
            agent: firstResponder,
            prompt: '',
            result: '',
          },
          {
            stepId: 'x0007-r001-enhance-result-Architect',
            stepStatus: 'pending',
            executionOrder: 7,
            round: 1,
            stepType: 'enhance_result',
            agent: multiAgents[0],
            prompt: '',
            result: '',
          },
          {
            stepId: 'x0008-r001-enhance-result-Critic',
            stepStatus: 'pending',
            executionOrder: 8,
            round: 1,
            stepType: 'enhance_result',
            agent: multiAgents[1],
            prompt: '',
            result: '',
          },
        ],
      }
      expect(workflow.toJSON()).toStrictEqual(expectedProps)
    })

    it(`returns a non-transient Failure of kind InvalidArgumentsError if steps are
        already defined`, () => {
      const workflowResult = Workflow.fromProps({
        workflowId: mockWorkflowId,
        instructions: preexistingStepsScenario.instructions,
        steps: preexistingStepsScenario.initialSteps,
      })
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const mockResult = 'Test Result'
      const mockPrompt = 'Test Prompt'
      const result = workflow.deployAgents(mockPrompt, mockResult, preexistingStepsScenario.agents, firstResponder)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test Workflow.toJSON
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
