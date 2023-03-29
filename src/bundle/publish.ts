import core from '@actions/core'
import exec from '@actions/exec'

const run = async (): Promise<void> => {
  try {
    const command = `mass bundle build`
    await exec.exec(command)
    // "must be set to any or unkown if specified"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
