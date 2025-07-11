import { handler } from './continueWorkflowWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Workflow Service handlers continueWorkflowWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
