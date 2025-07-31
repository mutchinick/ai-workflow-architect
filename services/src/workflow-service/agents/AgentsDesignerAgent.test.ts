import { AgentsDesignerAgent, WORKFLOW_PHASES } from './AgentsDesignerAgent'

describe('Workflow Service DeployWorkflowAgentsWorker agents AgentsDesignerAgent tests', () => {
  describe('Test System Prompt Blueprint', () => {
    const systemPrompt = AgentsDesignerAgent.system

    it('generates the expected blueprint from the WORKFLOW_PHASES object', () => {
      Object.values(WORKFLOW_PHASES).forEach((phase) => {
        expect(systemPrompt).toContain(`### ${phase.name}`)

        if (phase.agentRange.min === phase.agentRange.max) {
          expect(systemPrompt).toContain(`- **Agent Range:** ${phase.agentRange.min} (fixed)`)
        } else {
          expect(systemPrompt).toContain(
            `- **Agent Range:** ${phase.agentRange.min} (minimum) to ${phase.agentRange.max} (maximum)`,
          )
        }

        expect(systemPrompt).toContain(`- **Goal:** ${phase.goal}`)
      })
    })
  })
})
