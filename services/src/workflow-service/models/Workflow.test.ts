import KSUID from 'ksuid'
import { Result } from '../../errors/Result'
import { Agent } from '../agents/Agent'
import { Workflow, WorkflowInstructions, WorkflowProps } from './Workflow'
import {
  multiAgents,
  multiAgentScenario,
  preexistingStepsScenario,
  singleAgentScenario,
} from './fixtures/deploy-agents-fixtures'
import { shortQueryInstructions, standardValidInstructions } from './fixtures/from-instructions-fixures'
import {
  emptyWorkflowScenario,
  fullyExecutedScenario,
  initialStepValidScenario,
  invalidIdScenario,
  invalidInstructionsScenario,
  noStepsExecutedScenario,
  partiallyExecutedScenario,
} from './fixtures/from-props-fixtures'

jest.useFakeTimers().setSystemTime(new Date('2024-10-19T03:24:00Z'))

const mockDateSafe = '2024-10-19T03-24-00-000Z'
const mockKsuid = 'mockKsuid'
const mockQuery = 'mockQuery'
const mockWorkflowId = `workflow-${mockDateSafe}-${mockQuery}-${mockKsuid}`

function buildMockWorkflowInstructions(): WorkflowInstructions {
  const mockValidWorkflowProps: WorkflowInstructions = {
    query: mockQuery,
  }
  return mockValidWorkflowProps
}

function buildMockWorkflowProps(): WorkflowProps {
  const mockValidWorkflowProps: WorkflowProps = {
    workflowId: mockWorkflowId,
    instructions: {
      query: mockQuery,
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
     * Test expected results
     ************************************************************/
    it(`returns the expected Success<Workflow> if the execution path is successful`, () => {
      // Mock KSUID to return a fixed workflowId
      jest.spyOn(KSUID, 'randomSync').mockReturnValue({
        string: mockKsuid,
      } as never)

      const mockWorkflowInstructions = buildMockWorkflowInstructions()
      const result = Workflow.fromInstructions(mockWorkflowInstructions)
      const expectedWorkflow: WorkflowProps = {
        workflowId: mockWorkflowId,
        instructions: {
          query: mockWorkflowInstructions.query,
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
   * Test Workflow.getCurrentStep
   ************************************************************/
  describe(`Test Workflow.getCurrentStep`, () => {
    it(`returns null when no steps are present`, () => {
      const workflowResult = Workflow.fromProps(emptyWorkflowScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getCurrentStep()).toBeNull()
    })

    it(`returns the first step when no steps have been executed`, () => {
      const workflowResult = Workflow.fromProps(noStepsExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getCurrentStep()).toMatchObject({ stepId: 'x0001-deploy-agents' })
    })

    it(`returns the first pending step in a partially executed workflow`, () => {
      const workflowResult = Workflow.fromProps(partiallyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getCurrentStep()).toMatchObject({ stepId: 'x0003-agent-Agent-02' })
    })

    it(`returns null when all steps are completed`, () => {
      const workflowResult = Workflow.fromProps(fullyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getCurrentStep()).toBeNull()
    })
  })

  /*
   *
   *
   ************************************************************
   * Test Workflow.getLastExecutedStep
   ************************************************************/
  describe(`Test Workflow.getLastExecutedStep`, () => {
    it(`returns null when no steps are present`, () => {
      const workflowResult = Workflow.fromProps(emptyWorkflowScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getLastExecutedStep()).toBeNull()
    })

    it(`returns null when no steps have been completed`, () => {
      const workflowResult = Workflow.fromProps(noStepsExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getLastExecutedStep()).toBeNull()
    })

    it(`returns the correct step when only the initial step is completed`, () => {
      const workflowResult = Workflow.fromProps(initialStepValidScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getLastExecutedStep()).toMatchObject({ stepId: 'x0001-deploy-agents' })
    })

    it(`returns the last completed step in a partially executed workflow`, () => {
      const workflowResult = Workflow.fromProps(partiallyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getLastExecutedStep()).toMatchObject({ stepId: 'x0002-agent-Agent-01' })
    })

    it(`returns the final step in a fully executed workflow`, () => {
      const workflowResult = Workflow.fromProps(fullyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      expect(workflow.getLastExecutedStep()).toMatchObject({ stepId: 'x0003-agent-Agent-02' })
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
      const baseKey = `${workflowId}/${workflowId}`
      const expectedKey = `${baseKey}-x0000-created.json`
      expect(workflow.getObjectKey()).toBe(expectedKey)
    })

    it(`returns the correct key format when no steps have been executed`, () => {
      const workflowResult = Workflow.fromProps(noStepsExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const workflowId = noStepsExecutedScenario.props.workflowId
      const baseKey = `${workflowId}/${workflowId}`
      const expectedKey = `${baseKey}-x0000-created.json`
      expect(workflow.getObjectKey()).toBe(expectedKey)
    })

    it(`returns the correct key format for a partially executed workflow`, () => {
      const workflowResult = Workflow.fromProps(partiallyExecutedScenario.props)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const workflowId = partiallyExecutedScenario.props.workflowId
      const baseKey = `${workflowId}/${workflowId}`
      const expectedKey = `${baseKey}-x0002-agent-Agent-01.json`
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
      const mockAgent: Agent = {
        name: 'mockAgentDesigner',
        role: 'mockRole',
        directive: 'mockDirective',
        system: 'mockSystem',
        prompt: 'mockPrompt',
        phaseName: 'mockPhase',
      }
      const mockResult = 'mockResult'
      workflow.deployAgents(mockAgent.system, mockAgent.prompt, mockResult, mockAgent, singleAgentScenario.agents)
      const expectedProps: WorkflowProps = {
        workflowId: workflow.workflowId,
        instructions: singleAgentScenario.instructions,
        steps: [
          {
            stepId: 'x0001-deploy-agents',
            stepStatus: 'completed',
            executionOrder: 1,
            llmSystem: mockAgent.system,
            llmPrompt: mockAgent.prompt,
            llmResult: mockResult,
            agent: mockAgent,
          },
          {
            stepId: 'x0002-agent-Agent-01',
            stepStatus: 'pending',
            executionOrder: 2,
            llmSystem: singleAgentScenario.agents[0].system,
            llmPrompt: singleAgentScenario.agents[0].prompt,
            llmResult: '',
            agent: singleAgentScenario.agents[0],
          },
        ],
      }
      expect(workflow.toJSON()).toStrictEqual(expectedProps)
    })

    it(`generates the correct final state for multiple agents`, () => {
      const workflowResult = Workflow.fromInstructions(multiAgentScenario.instructions)
      const workflow = Result.getSuccessValueOrThrow(workflowResult)
      const mockAgent: Agent = {
        name: 'mockAgentDesigner',
        role: 'mockRole',
        directive: 'mockDirective',
        system: 'mockSystem',
        prompt: 'mockPrompt',
        phaseName: 'mockPhase',
      }
      const mockResult = 'mockResult'
      workflow.deployAgents(mockAgent.system, mockAgent.prompt, mockResult, mockAgent, multiAgentScenario.agents)
      const expectedProps: WorkflowProps = {
        workflowId: workflow.workflowId,
        instructions: multiAgentScenario.instructions,
        steps: [
          {
            stepId: 'x0001-deploy-agents',
            stepStatus: 'completed',
            executionOrder: 1,
            llmSystem: mockAgent.system,
            llmPrompt: mockAgent.prompt,
            llmResult: mockResult,
            agent: mockAgent,
          },
          {
            stepId: 'x0002-agent-Agent-01',
            stepStatus: 'pending',
            executionOrder: 2,
            llmSystem: multiAgents[0].system,
            llmPrompt: multiAgents[0].prompt,
            llmResult: '',
            agent: multiAgents[0],
          },
          {
            stepId: 'x0003-agent-Agent-02',
            stepStatus: 'pending',
            executionOrder: 3,
            llmSystem: multiAgents[1].system,
            llmPrompt: multiAgents[1].prompt,
            llmResult: '',
            agent: multiAgents[1],
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
      const mockAgent: Agent = {
        name: 'mockAgentDesigner',
        role: 'mockRole',
        directive: 'mockDirective',
        system: 'mockSystem',
        prompt: 'mockPrompt',
        phaseName: 'mockPhase',
      }
      const mockResult = 'mockResult'
      const result = workflow.deployAgents(
        mockAgent.system,
        mockAgent.prompt,
        mockResult,
        mockAgent,
        preexistingStepsScenario.agents,
      )
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
