import * as core from "@actions/core"
import * as exec from "@actions/exec"

/**
 * Check if there are any changes in the specified directory
 * This checks both staged/unstaged changes and untracked files
 */
const hasChangesInDirectory = async (
  directory: string
): Promise<boolean> => {
  core.info(`[hasChanges] Checking for changes in directory: ${directory}`)
  
  // Check what files changed in the current commit (HEAD)
  // This works even with shallow clones (fetch-depth: 1)
  core.info(`[hasChanges] Checking files changed in HEAD commit in ${directory}...`)
  
  let changedFiles = ""
  const diffTreeExitCode = await exec.exec(
    "git",
    ["diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD", "--", directory],
    {
      ignoreReturnCode: true,
      silent: true,
      listeners: {
        stdout: (data: Buffer) => {
          changedFiles += data.toString()
        }
      }
    }
  )

  // diff-tree returns 0 even if no files changed, so check the output
  if (changedFiles.trim().length > 0) {
    const fileCount = changedFiles.trim().split('\n').length
    core.info(`[hasChanges] ✓ Found ${fileCount} changed file(s) in ${directory} in HEAD commit`)
    return true
  }

  core.info(`[hasChanges] ✗ No changes detected in ${directory} in HEAD commit`)
  return false
}

const run = async (): Promise<void> => {
  const buildDirectory = core.getInput("build-directory", {required: false})
  const failWarnings = core.getInput("fail-warnings") === "true"
  const skipLint = core.getInput("skip-lint") === "true"
  const development = core.getInput("development") === "true"

  try {
    // Check if there are changes in the build directory
    // If not, skip publishing (NOOP for immutable registry)
    const hasChanges = await hasChangesInDirectory(buildDirectory)
    if (!hasChanges) {
      core.info(
        `No changes detected in ${buildDirectory}. Skipping publish due to immutable registry.`
      )
      return
    }

    const command = `mass bundle publish`
    const args = [`--build-directory`, buildDirectory]

    if (failWarnings) {
      args.push(`--fail-warnings`)
    }
    if (skipLint) {
      args.push(`--skip-lint`)
    }
    if (development) {
      args.push(`--development`)
    }

    await exec.exec(command, args)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message)
  }
  return
}

run()

export default run
