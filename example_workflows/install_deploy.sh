#!/bin/bash

# Installs GitHub workflows for a given Massdriver bundle.
# This script is intended to be run from a folder containing a massdriver.yaml.

WORKFLOW_DIRECTORY=./.github/workflows
WORKFLOW_NAME=md_app_deploy.yaml

# grep for `name` line in massdriver.yaml,
# cut at `:` and get second group,
# trim quotes if needed
# xargs trims whitespace
PROJECT_NAME=$(grep -o 'name: [^;]*' massdriver.yaml | cut -d \: -f 2 | tr -d '"' | xargs)
if [ "$PROJECT_NAME" == "" ]; then
    echo "Unable to parse massdriver.yaml. Are you running this script in the correct folder?"
    exit
fi


echo "This script installs a GitHub workflow for continuous deployment of your application on Massdriver."
echo "The workflow requires a working Dockerfile to package your application."
read -p "Install GitHub workflows for continuos deployment of $PROJECT_NAME? [y/n]?" -n 1 -r install_workflows
echo
if [[ $install_workflows =~ ^[Yy]$ ]]; then
    echo -n "Installing workflows to $WORKFLOW_DIRECTORY..."
    mkdir --parents $WORKFLOW_DIRECTORY
    wget -O $WORKFLOW_DIRECTORY/$WORKFLOW_NAME -q https://raw.githubusercontent.com/massdriver-cloud/actions/main/example_workflows/$WORKFLOW_NAME
    echo " done!"
    echo


    echo "The following steps aid in quick setup of your GitHub Workflows."
    echo "You can bail on this prompt at any point and fill out the env block in $WORKFLOW_DIRECTORY/$WORKFLOW_NAME later."

    # Registry setup
    DEFAULT_REGISTRY_NAMESPACE=$(grep -o 'REGISTRY_NAMESPACE: [^;]*' $WORKFLOW_DIRECTORY/$WORKFLOW_NAME | cut -d \: -f 2 | tr -d '"' | xargs)
    DEFAULT_REGISTRY_IMAGE_NAME=$PROJECT_NAME
    echo "To start, we set up a docker registry to push the image to."
    echo "For in-depth documentation, see https://docs.massdriver.cloud/cli/image/push."

    ## Namespace
    echo "First, enter a namespace for the registry:"
    read -p "Registry namespace [$DEFAULT_REGISTRY_NAMESPACE]: " REGISTRY_NAMESPACE
    REGISTRY_NAMESPACE=${REGISTRY_NAMESPACE:-$DEFAULT_REGISTRY_NAMESPACE}
    sed -ri "s/^(\s*REGISTRY_NAMESPACE\:)(.*)$/\1 $REGISTRY_NAMESPACE/" $WORKFLOW_DIRECTORY/$WORKFLOW_NAME

    ## Image
    echo "Enter the name of the image in the registry:"
    read -p "Image name [$DEFAULT_REGISTRY_IMAGE_NAME]: " REGISTRY_IMAGE_NAME
    REGISTRY_IMAGE_NAME=${REGISTRY_IMAGE_NAME:-$DEFAULT_REGISTRY_IMAGE_NAME}
    sed -ri "s/^(\s*REGISTRY_IMAGE_NAME\:)(.*)$/\1 $REGISTRY_IMAGE_NAME/" $WORKFLOW_DIRECTORY/$WORKFLOW_NAME

    ## Region
    echo "Specify a region for the registry."
    echo "Ensure the spelling is correct for your cloud provider - 'us-west-2' in AWS, 'westus2' in Azure, etc."
    read -p "Registry region: " REGISTRY_REGION
    sed -ri "s/^(\s*REGISTRY_REGION\:)(.*)$/\1 $REGISTRY_REGION/" $WORKFLOW_DIRECTORY/$WORKFLOW_NAME

    echo

    # Package Variables
    echo "Next, we need some information about the Massdriver package you're trying to deploy."
    echo "If you do not yet have this application deployed in Massdriver, you can stop here and fill in the env block in $WORKFLOW_DIRECTORY/$WORKFLOW_NAME later."
    echo 
    read -p "Continue? [y/n]?" -n 1 -r setup_package_vars
    if [[ $setup_package_vars =~ ^[Yy]$ ]]; then
        echo
        ## Project
        read -p "Massdriver Project name: " MASSDRIVER_PROJECT
        sed -ri "s/^(\s*MASSDRIVER_PROJECT\:)(.*)$/\1 $MASSDRIVER_PROJECT/" $WORKFLOW_DIRECTORY/$WORKFLOW_NAME
        ## Environment
        read -p "Massdriver Environment/Target within $MASSDRIVER_PROJECT: " MASSDRIVER_ENVIRONMENT
        echo $MASSDRIVER_ENVIRONMENT
        sed -ri "s/^(\s*MASSDRIVER_ENVIRONMENT\:)(.*)$/\1 $MASSDRIVER_ENVIRONMENT/" $WORKFLOW_DIRECTORY/$WORKFLOW_NAME
        ## Manifest
        read -p "Massdriver Manifest name within $MASSDRIVER_PROJECT/$MASSDRIVER_ENVIRONMENT: " MASSDRIVER_MANIFEST
        sed -ri "s/^(\s*MASSDRIVER_MANIFEST\:)(.*)$/\1 $MASSDRIVER_MANIFEST/" $WORKFLOW_DIRECTORY/$WORKFLOW_NAME
    fi
fi