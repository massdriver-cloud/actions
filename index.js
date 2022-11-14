const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const github = require('@actions/github');
const os = require('os');

async function run() {
  try {
    const version = core.getInput('version');
    core.info(`Downloading version ${version} of the Massdriver CLI!`);

    const owner = "massdriver-cloud";
    const repo = "massdriver-cli";

    const token = core.getInput('token');

    const octokit = github.getOctokit(token)

    const { data: versions } = await octokit.rest.repos.getLatestRelease({owner: owner, repo: repo});
    console.log(versions)

    await setup(version);

    // in future, set any ouputs here, like
    // core.setOutput('output_name', output_value);
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function setup(version) {
    // Example of how to throw an error that gets spat out by GHA:
    //if (x !== y) {
    //  throw new Error('glarblblargblarggabagook');
    //}

    // OS details
    const platform = os.platform();
    const arch = os.arch();

    downloadUrl = "https://github.com/massdriver-cloud/massdriver-cli/releases/download/v0.4.8/mass-v0.4.8-linux-arm64.tar.gz";

    const pathToCLIZip = await tc.downloadTool(downloadUrl);
    const pathToCLI = await tc.extractZip(pathToCLIZip);

    core.addPath(pathToCLI);
    return pathToCLI;
}

module.exports = setup
run();
