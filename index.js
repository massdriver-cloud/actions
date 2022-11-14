const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const github = require('@actions/github');
const os = require('os');
import mkdir from 'fs';

async function run() {
  try {
    const version = core.getInput('version', {required: false});
    core.info(`Downloading version ${version} of the Massdriver CLI!`);

    const token = core.getInput('token', {required: false});

    const octokit = github.getOctokit(token);

    const release = await getRelease(octokit, version)
    console.log("release:")
    console.log(release)
    const releaseResult = getReleaseResult(release);
    console.log("releaseResult:")
    console.log(releaseResult)

    

    await setup(version);

    // in future, set any ouputs here, like
    // core.setOutput('output_name', output_value);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function getRelease(octokit, version) {
  if (version === 'latest') {
    return await octokit.rest.repos.getLatestRelease("massdriver-cloud", "massdriver-cli");
  } else {
    return await octokit.rest.repos.getRelease({
      owner: "massdriver-cloud",
      repo: "massdriver-cli",
      release_id: Math.trunc(Number(version))
    });
  }
};

function getReleaseResult(release) {
  if (release.status !== 200) {
    throw new Error(`Unable to get release: ${release.status}`);
  }
  return release['data']['assets'][0];
}

async function downloadFile(asset_id, token) {
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
    owner: 'massdriver-cloud',
    repo: 'massdriver-cli',
  });
  headers = {
    accept,
    authorization: `token ${token}`,
  };

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

run();
