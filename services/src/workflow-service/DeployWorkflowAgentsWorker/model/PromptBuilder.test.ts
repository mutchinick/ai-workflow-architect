import { PromptBuilder } from './PromptBuilder'

describe(`Workflow Service DeployWorkflowAgentsWorker PromptBuilder tests`, () => {
  it(`returns an object with a valid system string`, () => {
    const userQuery = `What are the best practices for deploying AI agents in a software system?`
    const { system } = PromptBuilder.buildSystemAndPrompt(userQuery)
    expect(system).toBeDefined()
  })

  it(`returns an object with a valid prompt string`, () => {
    const userQuery = `What are the best practices for deploying AI agents in a software system?`
    const { prompt } = PromptBuilder.buildSystemAndPrompt(userQuery)
    expect(prompt).toBeDefined()
    expect(prompt).toContain(`<query>${userQuery}</query>`)
  })
})
