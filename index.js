const core = require('@actions/core');
const tc = require('@actions/tool-cache')

async function run() {
  try {
    const version = core.getInput('version');
    core.info(`Downloading version ${version} of the Massdriver CLI!`);

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
    downloadUrl = "https://github.com/massdriver-cloud/massdriver-cli/releases/download/v0.4.8/mass-v0.4.8-linux-arm64.tar.gz";

    const pathToTarball = await tc.downloadTool(downloadUrl);
    core.info(`path: ${pathToTarball}`);
    const pathToCLI = await tc.extractTar(pathToTarball);

    core.addPath(pathToCLI);
    return pathToCLI;
}

module.exports = setup
run();
