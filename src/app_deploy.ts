import * as core from "@actions/core"
import * as exec from "@actions/exec"

const run = async (): Promise<void> => {
  const project = core.getInput("project")
  const target = core.getInput("target")
  const manifest = core.getInput("manifest")

  try {
    const command = `mass app deploy ${project}-${target}-${manifest}`
    await exec.exec(command)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
