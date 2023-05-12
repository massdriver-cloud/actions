import * as core from "@actions/core"
import * as exec from "@actions/exec"

const run = async (): Promise<void> => {
  const buildDirectory = core.getInput("build-directory", {required: false})
  const access = core.getInput("access", {required: false})

  try {
    const command = `mass bundle publish`
    const args = [`--build-directory`, buildDirectory, `--access`, access]
    await exec.exec(command, args)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
