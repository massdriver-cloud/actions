import * as core from "@actions/core"
import * as exec from "@actions/exec"
import {Util} from '@docker/actions-toolkit/lib/util';

const run = async (): Promise<void> => {
  const namespace = core.getInput("namespace")
  const imageName = core.getInput("image-name")
  const artifact = core.getInput("artifact")
  const region = core.getInput("region")
  const imageTag = core.getInput("image-tag", {required: false})
  const imageTags = Util.getInputList("image-tags", {ignoreComma: true})
  const buildContext = core.getInput("build-context", {required: false})
  const dockerfile = core.getInput("dockerfile", {required: false})
  const skipBuild = core.getBooleanInput("skip-build", {required: false})

  try {
    const command = `mass image push ${namespace}/${imageName}`
    
    const simpleArgs = [
      `--artifact`,
      artifact,
      `--region`,
      region,
      `--build-context`,
      buildContext,
      `--dockerfile`,
      dockerfile,
    ]

    const tags = imageTag.length > 0 ? [imageTag] : imageTags
    const skipBuildFlag = skipBuild ? [`--skip-build`] : []
    
    const args = simpleArgs.concat(tags.flatMap(tag => [`--image-tag`, tag])).concat(skipBuildFlag)

    await exec.exec(command, args)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
