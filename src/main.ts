/* eslint-disable no-void */
import { dirname } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import * as core from '@actions/core';
import * as github from '@actions/github';
import retry from 'async-retry';
import type { Context } from '@actions/github/lib/context';
import type { HeadersInit } from 'node-fetch';
import fetch from 'node-fetch';
import * as tc from '@actions/tool-cache';

interface GetRepoResult {
  readonly owner: string;
  readonly repo: string;
}

interface GetReleaseOptions {
  readonly owner: string;
  readonly repo: string;
  readonly version: string;
}

const getRelease = (
  octokit: ReturnType<typeof github.getOctokit>,
  { owner, repo, version }: GetReleaseOptions
) => {
  const tagsMatch = version.match(/^tags\/(.*)$/);
  if (version === 'latest') {
    return octokit.rest.repos.getLatestRelease({ owner, repo });
  } else if (tagsMatch !== null && tagsMatch[1]) {
    return octokit.rest.repos.getReleaseByTag({
      owner,
      repo,
      tag: tagsMatch[1],
    });
  } else {
    return octokit.rest.repos.getRelease({
      owner,
      repo,
      release_id: Math.trunc(Number(version)),
    });
  }
};

type GetReleaseResult = ReturnType<typeof getRelease> extends Promise<infer T>
  ? T
  : never;

type Asset = GetReleaseResult['data']['assets'][0];

interface FetchAssetFileOptions {
  readonly id: number;
  readonly outputPath: string;
  readonly owner: string;
  readonly repo: string;
  readonly token: string;
}

const baseFetchAssetFile = async (
  octokit: ReturnType<typeof github.getOctokit>,
  { id, outputPath, owner, repo, token }: FetchAssetFileOptions
) => {
  const {
    body,
    headers: { accept, 'user-agent': userAgent },
    method,
    url,
  } = octokit.request.endpoint(
    'GET /repos/:owner/:repo/releases/assets/:asset_id',
    {
      asset_id: id,
      headers: {
        accept: 'application/octet-stream',
      },
      owner,
      repo,
    }
  );
  let headers: HeadersInit = {
    accept,
    authorization: `token ${token}`,
  };
  if (typeof userAgent !== 'undefined')
    headers = { ...headers, 'user-agent': userAgent };

  const response = await fetch(url, { body, headers, method });
  if (!response.ok) {
    const text = await response.text();
    core.warning(text);
    throw new Error('Invalid response');
  }
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  await mkdir(dirname(outputPath), { recursive: true });
  void (await writeFile(outputPath, new Uint8Array(arrayBuffer)));
};

const fetchAssetFile = (
  octokit: ReturnType<typeof github.getOctokit>,
  options: FetchAssetFileOptions
) =>
  retry(() => baseFetchAssetFile(octokit, options), {
    retries: 5,
    minTimeout: 1000,
  });

const printOutput = (release: GetReleaseResult): void => {
  core.info(`version: ${release.data.tag_name}`);
  core.info(`name: ${release.data.name}`);
};

const install = async (target: string) => {
  const pathToCLI = await tc.extractZip(target);
  core.info(`installed to ${pathToCLI}`);
  core.addPath(pathToCLI);
}

const filterByFileName = (file: string) => (asset: Asset) =>
  file === asset.name;

const main = async (): Promise<void> => {
  const owner = 'massdriver-cloud';
  const repo = 'massdriver-cli';
  const token = core.getInput('token', { required: false });
  const version = core.getInput('version', { required: false });
  const file = core.getInput('file', { required: true });
  const target = file;

  const octokit = github.getOctokit(token);
  const release = await getRelease(octokit, { owner, repo, version });

  const assetFilterFn = filterByFileName(file);

  const assets = release.data.assets.filter(assetFilterFn);
  if (assets.length === 0) throw new Error('Could not find asset id');
  for (const asset of assets) {
    await fetchAssetFile(octokit, {
      id: asset.id,
      outputPath: target,
      owner,
      repo,
      token,
    });
  }
  install(target);
  printOutput(release);
};

void main();
