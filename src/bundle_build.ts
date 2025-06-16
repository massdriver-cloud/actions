import * as core from "@actions/core"
import * as exec from "@actions/exec"

const run = async (): Promise<void> => {
  const buildDirectory = core.getInput("build-directory", {required: false})

  try {
    const command = `mass bundle build`
    const args = [`--build-directory`, buildDirectory]
    await exec.exec(command, args)
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
