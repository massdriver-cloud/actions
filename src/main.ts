import * as core from '@actions/core'
import {
  applicationDeployAction,
  ApplicationDeployOptions,
  setupAction,
  SetupActionOptions
} from './actions'

const main = async (): Promise<void> => {
  const token = core.getInput('token', {required: false})
  const tag = core.getInput('tag', {required: false})

  const opts: SetupActionOptions = {
    tag,
    token
  }
  setupAction(opts)

  if ('thing1' === tag) {
    const applicationDeployOpts: ApplicationDeployOptions = {
      tag,
      package_id: 'bar',
      params_filepath: 'foo'
    }
    applicationDeployAction(applicationDeployOpts)
  }
}

void main()
