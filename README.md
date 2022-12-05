# Massdriver GitHub Actions

A collection of GitHub Actions for interacting with [Massdriver](https://massdriver.cloud).

## Setup

Use this action to set up the Massdriver CLI for use in your workflows:

```yaml
jobs:
  massdriver:
    runs-on: ubuntu-latest
    steps:
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions/setup@v2.1
      - name: Use Massdriver CLI
        run: mass help
```

This will download the latest version of the Massdriver CLI. Optionally, a `tag` may be specified to install a specific [tagged release](https://github.com/massdriver-cloud/massdriver-cli/releases):

```yaml
- name: Install Massdriver CLI
  uses: massdriver-cloud/actions/setup@v2.1
  with:
    tag: v0.4.8
```

We test this action against `ubuntu-latest` and `macos-latest` GitHub runners. If you need to use this action on a different runner, please [open an issue](https://github.com/massdriver-cloud/actions/issues/new).
