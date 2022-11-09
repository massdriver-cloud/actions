const core = require('@actions/core')
const toolCache = require('@actions/tool-cache');

(async () => {
    try {
        await setupMassdriver()
    } catch (error) {
        core.setFailed(error.stack)
    }
})();

async function setupMassdriver() {
    const version = core.getInput('version')
    console.log(`Installing Massdriver CLI version ${version}`)
    //const pathToTarball = await toolCache.downloadTool(getDownloadURL());
    //const pathToCLI = await toolCache.extractTar(pathToTarball);

    //core.addPath(pathToCLI)
}
