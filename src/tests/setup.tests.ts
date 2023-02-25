import {setupAction, SetupOptions} from '../actions/index'

test('run successfully', async () => {
  const opts: SetupOptions = {
    tag: 'foo',
    token: 'bar'
  }
  await expect(setupAction(opts)).resolves.toBeUndefined()
})
