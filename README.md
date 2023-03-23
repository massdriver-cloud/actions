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

We test this action against `ubuntu-latest` and `macos-latest` GitHub runners. If you need to use this action on a different runner, please [open an issue](https://github.com/massdriver-cloud/actions/issues/new).
