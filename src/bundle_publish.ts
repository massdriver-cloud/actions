import * as core from "@actions/core"
import * as exec from "@actions/exec"

/**
 * Check if there are any changes in the specified directory
 * This checks both staged/unstaged changes and untracked files
 */
const hasChangesInDirectory = async (
  directory: string
): Promise<boolean> => {
  // First, check if directory exists in the current HEAD
  const lsTreeExitCode = await exec.exec(
    "git",
    ["ls-tree", "-d", "HEAD", directory],
    {
      ignoreReturnCode: true,
      silent: true
    }
  )

  // If directory doesn't exist in HEAD, it's a new directory with changes
  if (lsTreeExitCode !== 0) {
    core.info(`Directory ${directory} is new (not in HEAD), treating as having changes`)
    return true
  }

  // Check for tracked changes (staged and unstaged)
  const diffExitCode = await exec.exec(
    "git",
    ["diff", "--quiet", "HEAD", "--", directory],
    {
      ignoreReturnCode: true,
      silent: true
    }
  )

  // If diff returned non-zero exit code, there are changes
  if (diffExitCode !== 0) {
    return true
  }

  // Check for untracked files in the directory
  let untrackedOutput = ""
  await exec.exec("git", ["ls-files", "--others", "--exclude-standard", directory], {
    silent: true,
    listeners: {
      stdout: (data: Buffer) => {
        untrackedOutput += data.toString()
      }
    }
  })

  // If there's any output, there are untracked files
  if (untrackedOutput.trim().length > 0) {
    return true
  }

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
