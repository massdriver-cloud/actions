import * as core from '@actions/core'
import {setupAction, SetupOptions} from './actions'

const main = async (): Promise<void> => {
  const token = core.getInput('token', {required: false})
  const tag = core.getInput('tag', {required: false})

  const opts: SetupOptions = {
    tag,
    token
  }
  setupAction(opts)
}

void main()
