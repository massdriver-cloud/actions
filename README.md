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
          image-tag: ${{github.sha}}
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
  publish:
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
  publish:
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

### Image Push

Use this action to push an image, using the Massdriver CLI, to any of the supported cloud providers.

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
      - name: Push Image
        uses: massdriver-cloud/actions/image_push@v4
        with:
          namespace: 'massdriver-cloud'
          image-name: 'massdriver'
          artifact: ${{ vars.MASSDRIVER_ARTIFACT_ID }}
          region: 'us-west-2'
```
