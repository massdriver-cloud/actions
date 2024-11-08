import * as core from "@actions/core"
import * as exec from "@actions/exec"
import * as github from "@actions/github"

const run = async (): Promise<void> => {
  const project = core.getInput("project")
  // Get env from input or default to PR number prefixed with 'p'
  const env = core.getInput("env") || 
    (github.context.payload.pull_request?.number ? `p${github.context.payload.pull_request.number}` : '')
  
  if (!env) {
    core.setFailed("No environment specified and no pull request number found")
    return
  }

  try {
    const command = `mass preview decommission ${project}-${env}`
    await exec.exec(command)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
