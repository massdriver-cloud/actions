/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as core from '@actions/core'
import * as github from '@actions/github'
import retry from 'async-retry'
import {promises as fs} from 'fs'
import fetch from 'node-fetch'

interface FetchAssetFileOptions {
  readonly id: number
  readonly outputPath: string
  readonly owner: string
  readonly repo: string
  readonly token: string
}

const baseFetchAssetFile = async (
  octokit: ReturnType<typeof github.getOctokit>,
  {id, outputPath, owner, repo, token}: FetchAssetFileOptions
) => {
  const {
    body,
    headers: {accept, 'user-agent': userAgent},
    method,
    url
  } = octokit.request.endpoint(
    'GET /repos/:owner/:repo/releases/assets/:asset_id',
    {
      asset_id: id,
      headers: {
        accept: 'application/octet-stream'
      },
      owner,
      repo
    }
  )
  let headers: Record<string, string> = {
    accept,
    authorization: `token ${token}`
  }
  if (typeof userAgent !== 'undefined')
    headers = {...headers, 'user-agent': userAgent}

  const response = await fetch(url, {body, headers, method})
  if (!response.ok) {
    const text = await response.text()
    core.warning(text)
    throw new Error('Invalid response')
  }
  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()

  await fs.writeFile(outputPath, new Uint8Array(arrayBuffer))
}

const fetchAssetFile = async (
  octokit: ReturnType<typeof github.getOctokit>,
  options: FetchAssetFileOptions
) =>
  retry(async () => baseFetchAssetFile(octokit, options), {
    retries: 5,
    minTimeout: 1000
  })

export default fetchAssetFile
