import * as core from "@actions/core"
import * as exec from "@actions/exec"

const run = async (): Promise<void> => {
  const project = core.getInput("project", {required: true})
  const environment = core.getInput("environment", {required: true})
  const component = core.getInput("component", {required: true})
  const params = core.getInput("params", {required: false})
  const patch = core.getMultilineInput("patch", {required: false})
  const message = core.getInput("message", {required: false})

  if (params && patch.length > 0) {
    core.setFailed(
      "`params` and `patch` are mutually exclusive. Set one or neither, not both."
    )
    return
  }

  try {
    const instanceId = `${project}-${environment}-${component}`
    const args = ["instance", "deploy", instanceId, "--follow"]

    if (params) {
      args.push("--params", params)
    }
    for (const expr of patch) {
      args.push(`--patch=${expr}`)
    }
    if (message) {
      args.push("--message", message)
    }

    await exec.exec("mass", args)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()

export default run
