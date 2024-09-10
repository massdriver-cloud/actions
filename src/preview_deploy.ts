import * as core from "@actions/core"
import * as exec from "@actions/exec"

const run = async (): Promise<void> => {
  const params = core.getInput("params")

  try {
    const command = `mass preview deploy`
    const flag = [`--params ${params}`]
    await exec.exec(command, flag)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
