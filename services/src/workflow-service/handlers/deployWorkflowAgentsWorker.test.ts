import { handler } from './deployWorkflowAgentsWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Workflow Service handlers deployWorkflowAgentsWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
