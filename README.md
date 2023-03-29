# Massdriver GitHub Actions

A collection of GitHub Actions for interacting with [Massdriver](https://massdriver.cloud).

## Setup

Use this action to set up the [Massdriver CLI](https://github.com/massdriver-cloud/mass) for use in your workflows:

```yaml
jobs:
  massdriver:
    runs-on: ubuntu-latest
    steps:
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions/setup@v3
      - name: Use Massdriver CLI
        run: mass help
```

This will download the latest version of the Massdriver CLI. Optionally, a `tag` may be specified to install a specific [tagged release](https://github.com/massdriver-cloud/mass/releases):

```yaml
- name: Install Massdriver CLI
  uses: massdriver-cloud/actions/setup@v3
  with:
    tag: 1.0.0
```
## Bundle Publish

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
        uses: massdriver-cloud/actions/setup@v3
      - name: Publish Bundle
        uses: massdriver-cloud/actions/bundle_publish@v3
```

## Image Push

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
        uses: massdriver-cloud/actions/setup@v3
      - name: Push Image
        uses: massdriver-cloud/actions/image_push@andreas/more_actions
        with:
          namespace: 'massdriver-cloud'
          image-name: 'massdriver'
          artifact: ${{ vars.MASSDRIVER_ARTIFACT_ID }}
          region: 'us-west-2'
```
