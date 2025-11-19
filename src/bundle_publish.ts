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
  
  // Check if HEAD~1 (parent commit) exists
  core.info(`[hasChanges] Checking if HEAD~1 exists...`)
  const parentExitCode = await exec.exec(
    "git",
    ["rev-parse", "--verify", "HEAD~1"],
    {
      ignoreReturnCode: true,
      silent: true
    }
  )

  if (parentExitCode !== 0) {
    core.info(`[hasChanges] HEAD~1 not found, fetching parent commit...`)
    // Try to deepen the history by 1 commit (handles shallow clones)
    await exec.exec(
      "git",
      ["fetch", "--deepen=1"],
      {
        ignoreReturnCode: true
      }
    )
    
    // Check again if we now have HEAD~1
    const retryParentExitCode = await exec.exec(
      "git",
      ["rev-parse", "--verify", "HEAD~1"],
      {
        ignoreReturnCode: true,
        silent: true
      }
    )
    
    if (retryParentExitCode !== 0) {
      core.info(`[hasChanges] ✓ Still no parent commit (first commit in repo), publishing`)
      core.info(`====== [hasChanges] END ======`)
      return true
    }
    core.info(`[hasChanges] Successfully fetched parent commit`)
  }

  // Compare HEAD with HEAD~1 to see what changed
  core.info(`[hasChanges] Comparing HEAD~1 vs HEAD in ${directory}...`)
  let changedFiles = ""
  await exec.exec(
    "git",
    ["diff", "--name-only", "HEAD~1", "HEAD", "--", directory],
    {
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          changedFiles += data.toString()
        }
      }
    }
  )

  core.info(`[hasChanges] Changed files output: ${changedFiles.trim() || '(none)'}`)
  
  // Check if any files were returned
  if (changedFiles.trim().length > 0) {
    const fileCount = changedFiles.trim().split('\n').length
    core.info(`[hasChanges] ✓ Found ${fileCount} changed file(s) in ${directory}`)
    core.info(`====== [hasChanges] END ======`)
    return true
  }

  core.info(`[hasChanges] ✗ No changes detected in ${directory}`)
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
