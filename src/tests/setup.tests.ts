import {SetupOptions} from '../actions/index'

test('run successfully', async () => {
  const opts: SetupOptions = {
    tag: 'foo',
    token: 'bar'
  }
  expect(opts.tag).toEqual('foo')

  // is this the right scope to test?
  // what's a sane GHA test, how do we auto-generate all of this ChatGPlease?
  // are there helpers in '@actions/core' to mock these kinds of lines
  //   const octokit = github.getOctokit(opts.token)
  //   or do I need to create clients, interfaces, and all that... fun
  //   to test from the `setupAction(opts)` level

  // await expect(setupAction(opts)).resolves.toBeUndefined()
})
