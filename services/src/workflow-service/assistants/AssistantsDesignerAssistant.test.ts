import { AssistantsDesignerAssistant, WORKFLOW_PHASES } from './AssistantsDesignerAssistant'

describe('Workflow Service DeployWorkflowAssistantsWorker assistants AssistantsDesignerAssistant tests', () => {
  describe('Test System Prompt Blueprint', () => {
    const systemPrompt = AssistantsDesignerAssistant.system

    it('generates the expected blueprint from the WORKFLOW_PHASES object', () => {
      Object.values(WORKFLOW_PHASES).forEach((phase) => {
        expect(systemPrompt).toContain(`### ${phase.name}`)

        if (phase.assistantRange.min === phase.assistantRange.max) {
          expect(systemPrompt).toContain(`- **Assistant Range:** ${phase.assistantRange.min} (fixed)`)
        } else {
          expect(systemPrompt).toContain(
            `- **Assistant Range:** ${phase.assistantRange.min} (minimum) to ${phase.assistantRange.max} (maximum)`,
          )
        }

        expect(systemPrompt).toContain(`- **Goal:** ${phase.goal}`)
      })
    })
  })
})
