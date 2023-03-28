/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as tc from '@actions/tool-cache'

import {
  determineFile,
  fetchAssetFile,
  filterByFileName,
  getRelease
} from './utils/index'

interface SetupOptions {
  readonly tag: string
  readonly token: string
}

const run = async (): Promise<void> => {
  const token = core.getInput('token', {required: false})
  const tag = core.getInput('tag', {required: false})

  const opts: SetupOptions = {
    tag,
    token
  }
  setupAction(opts)
}

const setupAction = async (opts: SetupOptions) => {
  const owner = 'massdriver-cloud'
  const repo = 'mass'
  let {tag} = opts
  const octokit = github.getOctokit(opts.token)
  const release = await getRelease(octokit, tag, owner, repo)
  tag = tag === 'latest' ? release.data.tag_name : tag

  const file = determineFile(tag)
  const outputPath = `${process.env['RUNNER_TOOL_CACHE']}/${file}`
  const assetFilterFn = filterByFileName(file)
  const assets = release.data.assets.filter(assetFilterFn)
  if (assets.length === 0) throw new Error('Could not find asset id')
  for (const asset of assets) {
    await fetchAssetFile(octokit, {
      id: asset.id,
      outputPath,
      owner,
      repo,
      token: opts.token
    })
  }
  install(outputPath)
}

const install = async (target: string): Promise<void> => {
  const pathToCLI = await tc.extractTar(target)
  core.addPath(pathToCLI)
}

run()

export {SetupOptions}
export default run
