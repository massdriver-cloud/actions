import core from '@actions/core'
import exec from '@actions/exec'

interface ApplicationDeployOptions {
  tag: string
  package_id: string
  params_filepath: string
}

const applicationDeployAction = async (
  deploy: ApplicationDeployOptions
): Promise<void> => {
  try {
    const command = `mass application deploy ${deploy.package_id} -f ${deploy.params_filepath} -t ${deploy.tag}`
    core.debug(`command: ${command}`)
    await exec.exec(command)
    // "must be set to any or unkown if specified"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

export default applicationDeployAction
export {ApplicationDeployOptions}
