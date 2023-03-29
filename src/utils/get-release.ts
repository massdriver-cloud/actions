/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as github from "@actions/github"

type GetReleaseResult = ReturnType<typeof getRelease> extends Promise<infer T>
  ? T
  : never
type Asset = GetReleaseResult["data"]["assets"][0]

const getRelease = async (
  octokit: ReturnType<typeof github.getOctokit>,
  tag: string,
  owner: string,
  repo: string
) => {
  if (tag === "latest") {
    return octokit.rest.repos.getLatestRelease({owner, repo})
  } else {
    return octokit.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag
    })
  }
}

export {getRelease, Asset}
