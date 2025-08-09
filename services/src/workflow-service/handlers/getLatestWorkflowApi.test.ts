import { handler } from './getLatestWorkflowApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Workflow Service handlers getLatestWorkflowApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
