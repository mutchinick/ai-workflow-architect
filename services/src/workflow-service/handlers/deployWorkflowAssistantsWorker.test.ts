import { handler } from './deployWorkflowAssistantsWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Workflow Service handlers deployWorkflowAssistantsWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
