const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const github = require('@actions/github');
const os = require('os');
import { HeadersInit} from 'node-fetch';
import fetch from 'node-fetch';
import { mkdir } from 'fs';

async function run() {
  try {
    const version = core.getInput('version', {required: false});
    core.info(`Downloading version ${version} of the Massdriver CLI!`);

    const owner = "massdriver-cloud";
    const repo = "massdriver-cli";

    const token = core.getInput('token', {required: false});

    const octokit = github.getOctokit(token);

    const { data: versions } = await octokit.rest.repos.getLatestRelease({owner: owner, repo: repo});
    core.info('versions: ${versions[0]}');

    await setup(version);

    // in future, set any ouputs here, like
    // core.setOutput('output_name', output_value);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function downloadFile(asset_id, token) {
  const {
    body,
    headers: { accept, 'user-agent': userAgent },
    method,
    url,
  } = octokit.request.endpoint('GET /repos/:owner/:repo/releases/assets/:asset_id',
  {
    asset_id: asset_id,
    headers: {
      accept: 'application/octet-stream',
    },
    'massdriver-cloud',
    'massdriver-cli',
  });
  headers = {
    accept,
    authorization: `token ${token}`,
  };
  if (typeof userAgent !== 'undefined')
    headers = { ...headers, 'user-agent': userAgent };

  const response = await fetch(url, { body, headers, method});
  if (!response.ok) {
    const text = await response.text();
    core.warning(text);
    throw new Error('Invalid response');
  }

  const pathToCLIZip = await tc.downloadUrl(url, headers);
  const pathToCLI = await tc.extractZip(pathToCLIZip);

  return pathToCLI;
}

async function setup(version) {
    // Example of how to throw an error that gets spat out by GHA:
    //if (x !== y) {
    //  throw new Error('glarblblargblarggabagook');
    //}
    core.info(`version: ${version}`);

    downloadUrl = "https://github.com/massdriver-cloud/massdriver-cli/releases/download/v0.4.8/mass-v0.4.8-linux-arm64.tar.gz";

    const pathToCLIZip = await tc.downloadTool(downloadUrl);
    const pathToCLI = await tc.extractZip(pathToCLIZip);

    core.addPath(pathToCLI);
    return pathToCLI;
}

module.exports = setup
run();
