import { handler } from './createJobApi'

// COMBAK: Can mock clients to assert the Controller is built as expected
describe(`Template Service handlers createJobApi tests`, () => {
  it(`exports the handler function`, () => {
    expect(typeof handler).toBe('function')
  })
})
