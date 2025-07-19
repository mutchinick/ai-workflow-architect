import { handler } from './invokeBedrockApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Test Bedrock Service handlers invokeBedrockApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
