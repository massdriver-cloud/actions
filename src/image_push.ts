import * as core from "@actions/core"
import * as exec from "@actions/exec"

const run = async (): Promise<void> => {
  const namespace = core.getInput("namespace")
  const imageName = core.getInput("image-name")
  const artifact = core.getInput("artifact")
  const region = core.getInput("region")
  const imageTag = core.getInput("image-tag", {required: false})
  const buildContext = core.getInput("build-context", {required: false})

  try {
    const command = `mass image push ${namespace}/${imageName}`
    const args = [
      `--artifact`,
      artifact,
      `--image-tag`,
      imageTag,
      `--region`,
      region,
      `--build-context`,
      buildContext
    ]
    await exec.exec(command, args)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
