# Massdriver GitHub Action

Use this GitHub action to set up the Massdriver CLI for your workflows.

```yaml
jobs:
  massdriver:
    runs-on: ubuntu-latest
    steps:
      - name: Install Massdriver CLI
        uses: massdriver-cloud/actions
      - name: Use Massdriver CLI
        run: mass help
```
