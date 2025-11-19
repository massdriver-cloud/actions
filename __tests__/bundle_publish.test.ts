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
    it("should return true when directory does not exist in HEAD", async () => {
      // ls-tree returns non-zero (directory doesn't exist in HEAD)
      mockedExec.exec
        .mockResolvedValueOnce(1) // ls-tree fails
        .mockResolvedValueOnce(0) // mass bundle publish (won't be called in this test)

      await bundlePublish()

      // Verify ls-tree was called to check directory existence
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "git",
        ["ls-tree", "-d", "HEAD", "test-bundle"],
        expect.objectContaining({
          ignoreReturnCode: true,
          silent: true
        })
      )

      // Should have logged that it's a new directory
      expect(mockedCore.info).toHaveBeenCalledWith(
        "Directory test-bundle is new (not in HEAD), treating as having changes"
      )

      // Should attempt to publish
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "mass bundle publish",
        ["--build-directory", "test-bundle"]
      )
    })

    it("should return true when directory has tracked changes", async () => {
      mockedExec.exec
        .mockResolvedValueOnce(0) // ls-tree succeeds (directory exists)
        .mockResolvedValueOnce(1) // diff returns non-zero (has changes)
        .mockResolvedValueOnce(0) // mass bundle publish

      await bundlePublish()

      // Verify diff was called
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "git",
        ["diff", "--quiet", "HEAD", "--", "test-bundle"],
        expect.objectContaining({
          ignoreReturnCode: true,
          silent: true
        })
      )

      // Should attempt to publish
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "mass bundle publish",
        ["--build-directory", "test-bundle"]
      )
    })

    it("should return true when directory has untracked files", async () => {
      mockedExec.exec
        .mockResolvedValueOnce(0) // ls-tree succeeds
        .mockResolvedValueOnce(0) // diff returns zero (no tracked changes)
        .mockImplementationOnce(async (cmd, args, options) => {
          // ls-files returns untracked files
          if (options?.listeners?.stdout) {
            options.listeners.stdout(Buffer.from("test-bundle/untracked.txt\n"))
          }
          return 0
        })
        .mockResolvedValueOnce(0) // mass bundle publish

      await bundlePublish()

      // Verify ls-files was called to check untracked files
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "git",
        ["ls-files", "--others", "--exclude-standard", "test-bundle"],
        expect.objectContaining({
          silent: true,
          listeners: expect.objectContaining({
            stdout: expect.any(Function)
          })
        })
      )

      // Should attempt to publish
      expect(mockedExec.exec).toHaveBeenCalledWith(
        "mass bundle publish",
        ["--build-directory", "test-bundle"]
      )
    })

    it("should skip publish when no changes detected", async () => {
      mockedExec.exec
        .mockResolvedValueOnce(0) // ls-tree succeeds
        .mockResolvedValueOnce(0) // diff returns zero (no changes)
        .mockImplementationOnce(async (cmd, args, options) => {
          // ls-files returns nothing (no untracked files)
          if (options?.listeners?.stdout) {
            options.listeners.stdout(Buffer.from(""))
          }
          return 0
        })

      await bundlePublish()

      // Should have logged skip message
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
        .mockResolvedValueOnce(1) // ls-tree fails (new directory)
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

