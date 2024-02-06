import * as core from "@actions/core"
import * as exec from "@actions/exec"

const run = async (): Promise<void> => {
  const namespace = core.getInput("namespace")
  const imageName = core.getInput("image-name")
  const artifact = core.getInput("artifact")
  const region = core.getInput("region")
  const imageTag = core.getInput("image-tag", {required: false})
  const imageTags = core.getMultilineInput("image-tags", {required: false})
  const buildContext = core.getInput("build-context", {required: false})
  const dockerfile = core.getInput("dockerfile", {required: false})
  const skipBuild = core.getInput("skip-build", {required: false})

  try {
    const command = `mass image push ${namespace}/${imageName}`
    
    const args = [
      `--artifact`,
      artifact,
      `--region`,
      region,
      `--build-context`,
      buildContext,
      `--dockerfile`,
      dockerfile,
      `--skip-build`,
      skipBuild
    ]
    
    const tags = imageTag.length > 0 ? [imageTag] : imageTags
    
    const args_with_tags = args.concat(tags.flatMap(tag => [`--image-tag`, tag]))

    await exec.exec(command, args_with_tags)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
