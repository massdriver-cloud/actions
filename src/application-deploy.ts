import core from "@actions/core";
import exec from "@actions/exec";

const applicationDeploy = async (
  tag: string,
  package_id: string,
  params_filepath: string
) => {
  try {
    const command = `mass application deploy ${package_id} -f ${params_filepath} -t ${tag}`;
    core.debug(`command: ${command}`);
    await exec.exec(command);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}
