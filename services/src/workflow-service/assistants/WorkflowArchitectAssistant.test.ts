import { WorkflowArchitectAssistant, WORKFLOW_PHASES } from './WorkflowArchitectAssistant'

describe('Workflow Service DeployWorkflowAssistantsWorker assistants WorkflowArchitectAssistant tests', () => {
  describe('Test System Prompt Blueprint', () => {
    const systemPrompt = WorkflowArchitectAssistant.system

    it('generates the expected blueprint from the WORKFLOW_PHASES object', () => {
      Object.values(WORKFLOW_PHASES).forEach((phase) => {
        expect(systemPrompt).toContain(`### ${phase.name}`)
        expect(systemPrompt).toContain(`- **Goal:** ${phase.goal}`)
        expect(systemPrompt).toContain(`- **Assistant Guideline:** ${phase.assistantGuideline}`)
      })
    })
  })
})
