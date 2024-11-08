import * as core from "@actions/core"
import * as exec from "@actions/exec"
import * as github from "@actions/github"
import * as fs from "fs"
import * as path from "path"

interface PreviewParams {
  projectSlug: string;
}

const run = async (): Promise<void> => {
  // Get PR number and create env with 'p' prefix
  const prNumber = github.context.payload.pull_request?.number
  if (!prNumber) {
    core.setFailed("No pull request number found")
    return
  }
  const env = `p${prNumber}`

  // Read and parse the params file
  const paramsPath = core.getInput("params")
  let params: PreviewParams
  try {
    const fileContent = fs.readFileSync(path.resolve(paramsPath), 'utf8')
    params = JSON.parse(fileContent)
  } catch (error) {
    core.setFailed(`Failed to read or parse params file at ${paramsPath}: ${error}`)
    return
  }

  if (!params.projectSlug) {
    core.setFailed("No projectSlug found in params file")
    return
  }

  const envSlug = `${params.projectSlug}-${env}`
  core.info(`Attempting to decommission preview environment: ${envSlug}`)
  
  try {
    const command = `mass preview decommission ${envSlug}`
    await exec.exec(command)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()

export default run
