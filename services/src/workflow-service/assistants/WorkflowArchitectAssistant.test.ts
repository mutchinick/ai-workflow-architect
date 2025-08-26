import { WorkflowArchitectAssistant } from './WorkflowArchitectAssistant'

describe('Workflow Service DeployWorkflowAssistantsWorker assistants WorkflowArchitectAssistant tests', () => {
  describe('Test System Prompt Blueprint', () => {
    const systemPrompt = WorkflowArchitectAssistant.system

    it('defines the system prompt', () => {
      expect(systemPrompt).toBeDefined()
    })
  })
})
