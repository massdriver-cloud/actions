# Massdriver GitHub Actions

A collection of GitHub Actions for interacting with [Massdriver](https://massdriver.cloud).

Push images, patch, and deploy your applications with simple GH Workflows.

## Usage Example

Below is an annotated, abridged version of how we deploy Massdriver using Massdriver.

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  Deploy:
    runs-on: ubuntu-latest
    env:
      # Specify your Massdriver credentials as secrets.
      # See https://docs.massdriver.cloud/cli/overview#setup
      MASSDRIVER_API_KEY: ${{secrets.MASSDRIVER_API_KEY}}
      MASSDRIVER_ORG_ID: ${{secrets.MASSDRIVER_ORGANIZATION_ID}}
    steps:
      # Check out the repo
      - uses: actions/checkout@v3
      # Sets up the Massdriver CLI on the runner.
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions/setup@v4
      # Set up a container registry, 
      - name: Push Image
        uses: massdriver-cloud/actions/image_push@v4
        with:
          namespace: 'massdriver-cloud'
          image-name: 'massdriver'
          # The ID of the Auth artifact to use.
          # All artifacts can be found at https://app.massdriver.cloud/artifacts.
          # For AWS, use `aws-iam-role`. GCP: `gcp-service-account``. Azure: `azure-service-principal``.
          artifact: ${{secrets.ARTIFACT_ID}}
          # The region in which the container registry resides. Cloud-specific.
          region: 'us-west-2'
          # We use the GH SHA as image tag.
          image-tags: |
            ${{github.sha}}
            latest
      # Uploads the bundle to Massdriver
      - name: Publish Bundle
        uses: massdriver-cloud/actions/bundle_publish@v4
        with:
          build-directory: ./bundle
      # Once the application is deployed on Massdriver, app_patch can be used to update bundle parameters.
      # Here, we're updating the image tag to the image we pushed in the `Push Image` step.
      - name: Set Image Version
        uses: massdriver-cloud/actions/app_patch@v4
        with:
          project: md
          env: prod
          manifest: massdriver
          set: |
            .image.tag = "${{github.sha}}"
      # Deploys the updated application
      - name: Deploy App
        uses: massdriver-cloud/actions/app_deploy@v4
        with:
          project: md
          env: prod
          manifest: massdriver
```

## Quick Setup

To quickly add a basic GH workflow to your project, you can copy the [example workflow](example-workflow.yaml).
In the spirit of [release early, release often](https://en.wikipedia.org/wiki/Release_early,_release_often), the example deploys on every push to main, but can be easily adapted to your needs.

### Configuration

Configuration is contained to the `env` block in the workflow:

```yml
env:
  # Massdriver Secrets
  # These should be referencing encrypted GH secrets.
  # For API_KEY and ORG_ID, see https://docs.massdriver.cloud/cli/overview#setup
  MASSDRIVER_API_KEY: ${{secrets.MASSDRIVER_API_KEY}}
  MASSDRIVER_ORG_ID: ${{secrets.MASSDRIVER_ORG_ID}}
  # The Massdriver Artifact used to push the image.
  # I.e. for AWS, this would reference an aws-iam-role that you've added as credentials to Massdriver.
  MASSDRIVER_ARTIFACT_ID: ${{secrets.MASSDRIVER_ARTIFACT_ID}}
  # Massdriver Package Variables
  # Used to deploy the application. For more information, see https://docs.massdriver.cloud/applications/deploy
  # The name of the project to which to deploy
  MASSDRIVER_PROJECT: project
  # The name of the environment (formerly target) to which to deploy
  MASSDRIVER_ENVIRONMENT: prod
  # The name of the manifest
  MASSDRIVER_MANIFEST: x-app
  # Registry Variables
  # The namespace under which the registry should be created
  REGISTRY_NAMESPACE: mycompany
  # The name of the image within the registry
  REGISTRY_IMAGE_NAME: x-app
  # The region the registry should exist in.
  # Note the spelling here is cloud-specific -
  # `us-west-2` for AWS vs `westus2` for Azure.
  REGISTRY_REGION: us-west-2
  # Image Tag
  # By default, we use the SHA of the commit.
  IMAGE_TAG: ${{github.sha}}
  # Local paths
  # Specify the folder containing the bundle's massdriver.yaml.
  BUNDLE_FOLDER: ./bundle
```

## Actions

### Setup

Use the root action to set up the [Massdriver CLI](https://github.com/massdriver-cloud/mass) for use in your workflows.

```yaml
jobs:
  massdriver:
    runs-on: ubuntu-latest
    steps:
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v4
      - name: Use Massdriver CLI
        run: mass help
```

This will download the latest version of the Massdriver CLI. Optionally, a `tag` may be specified to install a specific [tagged release](https://github.com/massdriver-cloud/mass/releases):

```yaml
- name: Install Massdriver CLI
  uses: massdriver-cloud/actions/setup@v4
  with:
    tag: 1.0.0
```

### App Deploy

Deploys a configured application to Massdriver.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ vars.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v3
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v4
      - name: Deploy App
        uses: massdriver-cloud/actions/app_deploy@v4
        with:
          project: ecomm
          env: prod
          manifest: db
```

### App Patch

This action will patch the parameters of an existing application.

```yaml
jobs:
  patch:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ vars.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v3
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v4
      - name: Patch App
        uses: massdriver-cloud/actions/app_patch@v4
        with:
          project: ecomm
          env: prod
          manifest: db
          set: |
            .image.repository = "example/foo"
            .image.tag = "v2"
```

### Bundle Publish

Use this action to publish a bundle to Massdriver:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ vars.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v3
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v4
      - name: Publish Bundle
        uses: massdriver-cloud/actions/bundle_publish@v4
```

### Bundle Build

Use this action to build schemas from massdriver.yaml:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ vars.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v3
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v4
      - name: Build Bundle
        uses: massdriver-cloud/actions/bundle_build@v4
```

### Image Push

Use this action to push an image, using the Massdriver CLI, to any of the supported cloud providers.

```yaml
jobs:
  image_push:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ vars.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v3
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v4
      - name: Push Image
        uses: massdriver-cloud/actions/image_push@v4
        with:
          namespace: 'massdriver-cloud'
          image-name: 'massdriver'
          artifact: ${{ vars.MASSDRIVER_ARTIFACT_ID }}
          region: 'us-west-2'
```
