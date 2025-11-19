import * as core from "@actions/core"
import * as exec from "@actions/exec"

/**
 * Check if there are any changes in the specified directory
 * This checks both staged/unstaged changes and untracked files
 */
const hasChangesInDirectory = async (
  directory: string
): Promise<boolean> => {
  core.info(`====== [hasChanges] START ======`)
  core.info(`[hasChanges] Checking for changes in directory: ${directory}`)
  
  // Use git log to get files changed in HEAD commit - works with shallow clones
  core.info(`[hasChanges] Running: git log --format="" --name-only -1 HEAD -- ${directory}`)
  
  let changedFiles = ""
  await exec.exec(
    "git",
    ["log", "--format=", "--name-only", "-1", "HEAD", "--", directory],
    {
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          changedFiles += data.toString()
        },
        stderr: (data: Buffer) => {
          core.info(`[hasChanges] git stderr: ${data.toString()}`)
        }
      }
    }
  )

  core.info(`[hasChanges] Raw output length: ${changedFiles.length}`)
  core.info(`[hasChanges] Raw output (first 200 chars): ${changedFiles.substring(0, 200)}`)
  
  // Check if any files were returned
  if (changedFiles.trim().length > 0) {
    const fileCount = changedFiles.trim().split('\n').length
    core.info(`[hasChanges] ✓ Found ${fileCount} changed file(s) in ${directory} in HEAD commit`)
    return true
  }

  core.info(`[hasChanges] ✗ No changes detected in ${directory} in HEAD commit`)
  core.info(`====== [hasChanges] END ======`)
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
