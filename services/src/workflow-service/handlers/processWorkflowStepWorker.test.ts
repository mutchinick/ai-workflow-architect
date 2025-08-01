import { handler } from './processWorkflowStepWorker'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Workflow Service handlers processWorkflowStepWorker tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
