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
      expect(system).toContain(`Your primary directive is: "${mockAgent.directive}"`)
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
      expect(system).toContain(`Your primary directive is: "${mockAgent.directive}"`)
      expect(system).toContain('Your response must be ONLY the refined text.')
    })

    it('should return the correct user prompt', () => {
      const { prompt } = AgentPromptBuilder.buildEnhanceResult(mockAgent, mockLlmResponse)
      expect(prompt).toContain(`<original_result>The pyramids were built by ancient Egyptians.</original_result>`)
      expect(prompt).toContain('Based on your directive, enhance the following text:')
    })
  })
})
