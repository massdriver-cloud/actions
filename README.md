# Massdriver GitHub Actions

A collection of GitHub Actions for interacting with [Massdriver](https://massdriver.cloud).

Build, publish, and deploy your bundles and instances with simple GH Workflows.

> **Upgrading from v5?** See the [migration guide](MIGRATION.md). v6 removes `app_deploy`, `app_patch`, `image_push`, `preview_deploy`, `preview_decommission`, and `definition_publish`, and introduces `instance_deploy` along with various configuration changes.

## Usage Example

Below is an annotated example of how to use GitHub actions to publish and deploy a bundle on Massdriver.

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
      MASSDRIVER_ORG_ID: ${{secrets.MASSDRIVER_ORG_ID}}
      # Required for self-hosted Massdriver instances. Omit when using the SaaS platform.
      # MASSDRIVER_URL: https://api.your.massdriver.domain
    steps:
      # Check out the repo
      - uses: actions/checkout@v4
      # Sets up the Massdriver CLI on the runner.
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions/setup@v6
      # Uploads the bundle to Massdriver
      - name: Publish Bundle
        uses: massdriver-cloud/actions/bundle_publish@v6
        with:
          bundle-directory: ./bundle
      # Deploys the instance, patching the image tag to the commit we just built.
      - name: Deploy Instance
        uses: massdriver-cloud/actions/instance_deploy@v6
        with:
          project: api
          environment: prod
          component: app
          patch: |
            .image.tag = "${{github.sha}}"
```

## Quick Setup

For drop-in workflows covering common scenarios see [`example_workflows/`](example_workflows/). Copy the file that fits your use case into `.github/workflows/` and adjust the inputs.

### Configuration

Credentials are passed via the `env` block. The API Key is a sensitive value, so it should be stored and referenced as a encrypted GitHub secret. Organization ID is non-sensitive and can be specified in-line or as a GitHub secret or variable.

```yml
env:
  # See https://docs.massdriver.cloud/cli/overview#setup
  MASSDRIVER_API_KEY: ${{secrets.MASSDRIVER_API_KEY}}
  MASSDRIVER_ORG_ID: ${{secrets.MASSDRIVER_ORG_ID}}
  # Required for self-hosted Massdriver instances. Omit when using the SaaS platform.
  # MASSDRIVER_URL: https://api.your.massdriver.domain
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
        uses: massdriver-cloud/actions@v6
      - name: Use Massdriver CLI
        run: mass help
```

This will download the latest version of the Massdriver CLI. Optionally, a `tag` may be specified to install a specific [tagged release](https://github.com/massdriver-cloud/mass/releases):

```yaml
- name: Install Massdriver CLI
  uses: massdriver-cloud/actions/setup@v6
  with:
    tag: 2.0.0
```

### Instance Deploy

Deploys an instance to Massdriver. The bundle backing the instance must already be published to Massdriver and the component must already exist on the project's blueprint.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ secrets.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v4
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v6
      - name: Deploy Instance
        uses: massdriver-cloud/actions/instance_deploy@v6
        with:
          project: ecomm
          environment: prod
          component: db
```

#### Patching parameters at deploy time

Use `patch` to apply one or more JQ expressions (one per line) to the last deployed configuration before deploying. This is the typical way to update a single field — like the image tag — without rewriting the full configuration:

```yaml
- name: Deploy Instance
  uses: massdriver-cloud/actions/instance_deploy@v6
  with:
    project: ecomm
    environment: prod
    component: api
    patch: |
      .image.repository = "example/foo"
      .image.tag = "${{ github.sha }}"
```

#### Replacing the full configuration

Use `params` to fully replace the instance configuration from a file (json, yaml, tfvars, or toml):

```yaml
- name: Deploy Instance
  uses: massdriver-cloud/actions/instance_deploy@v6
  with:
    project: ecomm
    environment: prod
    component: api
    params: ./params.yaml
```

`params` and `patch` are mutually exclusive. Set one or neither, not both.

#### Deploy message

Optionally attach a message to the deploy that shows up in Massdriver:

```yaml
- name: Deploy Instance
  uses: massdriver-cloud/actions/instance_deploy@v6
  with:
    project: ecomm
    environment: prod
    component: api
    message: "Promoting ${{ github.sha }} to prod"
```

### Bundle Publish

Use this action to publish a bundle to Massdriver:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ secrets.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v4
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v6
      - name: Publish Bundle
        uses: massdriver-cloud/actions/bundle_publish@v6
```

#### Immutable Registry

The Massdriver bundle registry is immutable per the `version:` field in your `massdriver.yaml` file. Once a version is published, it cannot be changed. The one exception is version `0.0.0`, which is treated as mutable for backwards compatibility.

To optimize CI/CD performance, this action will automatically skip publishing if no changes are detected in the directory containing the `massdriver.yaml` file. This change detection is based on actual file modifications (not just the version field) because development builds auto-generate a `-dev.SUFFIX` on the version currently in the `massdriver.yaml` file.

For more information about versioning and release strategies, see the [Versions documentation](https://docs.massdriver.cloud/concepts/versions).

#### Development Builds

For development workflows, you can publish bundles with auto-generated version suffixes using the `development` flag:

```yaml
- name: Publish Bundle (Development)
  uses: massdriver-cloud/actions/bundle_publish@v6
  with:
    development: true
```

A common pattern is to publish development versions on pull requests, enabling you to test bundle changes with real infrastructure before merging to production:

```yaml
name: Test Bundle Changes

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ secrets.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v4
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v6
      - name: Publish Development Bundle
        uses: massdriver-cloud/actions/bundle_publish@v6
        with:
          bundle-directory: ./bundle
          development: true
```

This workflow publishes a development version of your bundle whenever a pull request is opened or updated. These development versions can be deployed to test environments in Massdriver, allowing you to validate infrastructure changes with actual cloud resources as part of your continuous integration strategy.

Learn more about [rapid infrastructure testing with development releases](https://docs.massdriver.cloud/concepts/versions#rapid-infrastructure-testing).

#### Additional Options

The bundle publish action supports additional configuration options:

```yaml
- name: Publish Bundle
  uses: massdriver-cloud/actions/bundle_publish@v6
  with:
    # Path to directory containing massdriver.yaml (default: '.')
    bundle-directory: ./bundle
    # Skip linting before publish (default: false)
    skip-lint: false
    # Fail if lint produces warnings (default: false)
    fail-warnings: true
    # Publish as development version with auto-generated suffix (default: false)
    development: false
```

### Bundle Build

Use this action to build schemas from massdriver.yaml:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ secrets.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v4
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions@v6
      - name: Build Bundle
        uses: massdriver-cloud/actions/bundle_build@v6
```
