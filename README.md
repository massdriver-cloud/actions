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

## Bundle Actions

### Publish

Use this action to publish a bundle to Massdriver:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    env:
      MASSDRIVER_API_KEY: ${{ secrets.MASSDRIVER_API_KEY }}
      MASSDRIVER_ORG_ID: ${{ secrets.MASSDRIVER_ORG_ID }}
    steps:
      - uses: actions/checkout@v3
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions/setup@v3
      - name: Publish Bundle
        run: massdriver-cloud/actions/bundle/publish@v3
```

If you do not yet have an API key, you can generate one in the [Massdriver Console](https://app.massdriver.cloud/organization/api-keys).
