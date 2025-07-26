import { Result } from '../../errors/Result'
import { AgentPromptBuilder } from './AgentPromptBuilder'
import { AgentsDesignerAgent } from './AgentsDesignerAgent'
import { FirstResponderAgent } from './FirstResponderAgent'

const mockUserQuery = 'Who built the pyramids?'
const mockLlmResponse = 'The pyramids were built by ancient Egyptians.'
const mockAgent = {
  name: 'Test Agent',
  role: 'A test role',
  directive: 'A test directive for enhancing results.',
}

describe('Workflow Service DeployWorkflowAgentsWorker AgentPromptBuilder tests', () => {
  /*
   *
   *
   ************************************************************
   * Test buildPrompt
   ************************************************************/
  describe('Test buildPrompt', () => {
    beforeEach(() => {
      jest
        .spyOn(AgentPromptBuilder, 'buildDeployAgents')
        .mockReturnValue({ system: 'deploy_system', prompt: 'deploy_prompt' })
      jest
        .spyOn(AgentPromptBuilder, 'buildFirstResponder')
        .mockReturnValue({ system: 'first_responder_system', prompt: 'first_responder_prompt' })
      jest
        .spyOn(AgentPromptBuilder, 'buildEnhancePrompt')
        .mockReturnValue({ system: 'enhance_prompt_system', prompt: 'enhance_prompt_prompt' })
      jest
        .spyOn(AgentPromptBuilder, 'buildEnhanceResult')
        .mockReturnValue({ system: 'enhance_result_system', prompt: 'enhance_result_prompt' })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should call buildDeployAgents when stepType is "deploy_agents"', () => {
      const stepType = 'deploy_agents'
      const result = AgentPromptBuilder.buildPrompt(mockAgent, mockUserQuery, stepType)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(AgentPromptBuilder.buildDeployAgents).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(AgentPromptBuilder.buildDeployAgents).toHaveBeenCalledWith(mockAgent, mockUserQuery)

      expect(Result.isSuccess(result)).toBe(true)
      const output = Result.getSuccessValueOrThrow(result)
      expect(output).toEqual({ system: 'deploy_system', prompt: 'deploy_prompt' })
    })

    it('should call buildFirstResponder when stepType is "first_responder"', () => {
      const stepType = 'first_responder'
      const result = AgentPromptBuilder.buildPrompt(mockAgent, mockUserQuery, stepType)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(AgentPromptBuilder.buildFirstResponder).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(AgentPromptBuilder.buildFirstResponder).toHaveBeenCalledWith(mockAgent, mockUserQuery)

      expect(Result.isSuccess(result)).toBe(true)
      const output = Result.getSuccessValueOrThrow(result)
      expect(output).toEqual({ system: 'first_responder_system', prompt: 'first_responder_prompt' })
    })

    it('should call buildEnhancePrompt when stepType is "enhance_prompt"', () => {
      const stepType = 'enhance_prompt'
      const result = AgentPromptBuilder.buildPrompt(mockAgent, mockUserQuery, stepType)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(AgentPromptBuilder.buildEnhancePrompt).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(AgentPromptBuilder.buildEnhancePrompt).toHaveBeenCalledWith(mockAgent, mockUserQuery)

      expect(Result.isSuccess(result)).toBe(true)
      const output = Result.getSuccessValueOrThrow(result)
      expect(output).toEqual({ system: 'enhance_prompt_system', prompt: 'enhance_prompt_prompt' })
    })

    it('should call buildEnhanceResult when stepType is "enhance_result"', () => {
      const stepType = 'enhance_result'
      const result = AgentPromptBuilder.buildPrompt(mockAgent, mockLlmResponse, stepType)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(AgentPromptBuilder.buildEnhanceResult).toHaveBeenCalledTimes(1)
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(AgentPromptBuilder.buildEnhanceResult).toHaveBeenCalledWith(mockAgent, mockLlmResponse)
      expect(Result.isSuccess(result)).toBe(true)
      const output = Result.getSuccessValueOrThrow(result)
      expect(output).toEqual({ system: 'enhance_result_system', prompt: 'enhance_result_prompt' })
    })

    it('should return a non-transient Failure of kind InvalidArgumentsError for an unrecognized stepType', () => {
      const invalidStepType = 'unrecognized_step' as never
      const result = AgentPromptBuilder.buildPrompt(mockAgent, mockUserQuery, invalidStepType)
      expect(Result.isFailure(result)).toBe(true)
      expect(Result.isFailureOfKind(result, 'InvalidArgumentsError')).toBe(true)
      expect(Result.isFailureTransient(result)).toBe(false)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test buildDeployAgents
   ************************************************************/
  describe('Test buildDeployAgents', () => {
    it('should return the correct system prompt', () => {
      const { system } = AgentPromptBuilder.buildDeployAgents(AgentsDesignerAgent, mockUserQuery)
      expect(system).toBe(AgentsDesignerAgent.directive)
    })

    it('should return the correct user prompt', () => {
      const { prompt } = AgentPromptBuilder.buildDeployAgents(AgentsDesignerAgent, mockUserQuery)
      expect(prompt).toContain('<query>Who built the pyramids?</query>')
      expect(prompt).toContain('Design the GenAI agents for the following user query:')
    })
  })

  /*
   *
   *
   ************************************************************
   * Test buildFirstResponder
   ************************************************************/
  describe('Test buildFirstResponder', () => {
    it('should return the correct system prompt', () => {
      const { system } = AgentPromptBuilder.buildFirstResponder(FirstResponderAgent, mockUserQuery)
      expect(system).toBe(FirstResponderAgent.directive)
    })

    it('should return the correct user prompt', () => {
      const { prompt } = AgentPromptBuilder.buildFirstResponder(FirstResponderAgent, mockUserQuery)
      expect(prompt).toBe(mockUserQuery)
    })
  })

  /*
   *
   *
   ************************************************************
   * Test buildEnhancePrompt
   ************************************************************/
  describe('Test buildEnhancePrompt', () => {
    it('should return the correct system prompt', () => {
      const { system } = AgentPromptBuilder.buildEnhancePrompt(mockAgent, mockUserQuery)
      expect(system).toContain('You are an AI assistant acting as a query refiner.')
      expect(system).toContain(`${mockAgent.directive}`)
      expect(system).toContain('Your response must be ONLY the refined query string.')
    })

    it('should return the correct user prompt', () => {
      const { prompt } = AgentPromptBuilder.buildEnhancePrompt(mockAgent, mockUserQuery)
      expect(prompt).toContain('<original_query>Who built the pyramids?</original_query>')
      expect(prompt).toContain('Based on your directive, refine the following user query:')
    })
  })

  /*
   *
   *
   ************************************************************
   * Test buildEnhanceResult
   ************************************************************/
  describe('Test buildEnhanceResult', () => {
    it('should return the correct system prompt', () => {
      const { system } = AgentPromptBuilder.buildEnhanceResult(mockAgent, mockLlmResponse)
      expect(system).toContain('You are an AI assistant acting as a result enhancer.')
      expect(system).toContain(`${mockAgent.directive}`)
      expect(system).toContain('Your response must be ONLY the refined text.')
    })

    it('should return the correct user prompt', () => {
      const { prompt } = AgentPromptBuilder.buildEnhanceResult(mockAgent, mockLlmResponse)
      expect(prompt).toContain(`<original_result>The pyramids were built by ancient Egyptians.</original_result>`)
      expect(prompt).toContain('Based on your directive, enhance the following text:')
    })
  })
})
