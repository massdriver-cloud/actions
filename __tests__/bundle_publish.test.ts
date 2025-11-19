import * as exec from "@actions/exec"
import * as core from "@actions/core"

// Mock the modules
jest.mock("@actions/exec")
jest.mock("@actions/core")

const mockedExec = exec as jest.Mocked<typeof exec>
const mockedCore = core as jest.Mocked<typeof core>

// Import after mocking
import bundlePublish from "../src/bundle_publish"

describe("bundle_publish", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock core.getInput to return defaults
    mockedCore.getInput.mockImplementation((name: string) => {
      const defaults: Record<string, string> = {
        "build-directory": "test-bundle",
        "fail-warnings": "false",
        "skip-lint": "false",
        "development": "false"
      }
      return defaults[name] || ""
    })
  })

  describe("hasChangesInDirectory", () => {
    it("should return true when directory has changes in HEAD commit", async () => {
      mockedExec.exec
        .mockImplementationOnce(async (cmd, args, options) => {
          // git log returns changed files
          if (options?.listeners?.stdout) {
            options.listeners.stdout(Buffer.from("test-bundle/massdriver.yaml\ntest-bundle/src/main.tf\n"))
          }
          return 0
        })
        .mockResolvedValueOnce(0) // mass bundle publish

      await bundlePublish()

      // Verify git log was called to check HEAD commit
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "git",
        ["log", "--format=", "--name-only", "-1", "HEAD", "--", "test-bundle"],
        expect.objectContaining({
          ignoreReturnCode: true,
          listeners: expect.objectContaining({
            stdout: expect.any(Function),
            stderr: expect.any(Function)
          })
        })
      )

      // Should have logged changed files count
      expect(mockedCore.info).toHaveBeenCalledWith(
        "[hasChanges] ✓ Found 2 changed file(s) in test-bundle in HEAD commit"
      )

      // Should attempt to publish
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "mass bundle publish",
        ["--build-directory", "test-bundle"]
      )
    })

    it("should skip publish when no changes detected in HEAD commit", async () => {
      mockedExec.exec
        .mockImplementationOnce(async (cmd, args, options) => {
          // git log returns no files (empty output)
          if (options?.listeners?.stdout) {
            options.listeners.stdout(Buffer.from(""))
          }
          return 0
        })

      await bundlePublish()

      // Should have logged no changes
      expect(mockedCore.info).toHaveBeenCalledWith(
        "[hasChanges] ✗ No changes detected in test-bundle in HEAD commit"
      )
      expect(mockedCore.info).toHaveBeenCalledWith(
        "No changes detected in test-bundle. Skipping publish due to immutable registry."
      )

      // Should NOT call mass bundle publish
      expect(mockedExec.exec).not.toHaveBeenCalledWith(
        "mass bundle publish",
        expect.any(Array)
      )
    })

    it("should pass correct flags to bundle publish command", async () => {
      mockedCore.getInput.mockImplementation((name: string) => {
        const inputs: Record<string, string> = {
          "build-directory": "my-bundle",
          "fail-warnings": "true",
          "skip-lint": "true",
          "development": "true"
        }
        return inputs[name] || ""
      })

      mockedExec.exec
        .mockImplementationOnce(async (cmd, args, options) => {
          // diff-tree returns changes
          if (options?.listeners?.stdout) {
            options.listeners.stdout(Buffer.from("my-bundle/massdriver.yaml\n"))
          }
          return 0
        })
        .mockResolvedValueOnce(0) // mass bundle publish

      await bundlePublish()

      // Should call with all flags
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "mass bundle publish",
        [
          "--build-directory",
          "my-bundle",
          "--fail-warnings",
          "--skip-lint",
          "--development"
        ]
      )
    })

    it("should handle errors and set failed status", async () => {
      const error = new Error("Git command failed")
      
      mockedExec.exec.mockRejectedValueOnce(error)

      await bundlePublish()

      expect(mockedCore.setFailed).toHaveBeenCalledWith("Git command failed")
    })
  })
})

