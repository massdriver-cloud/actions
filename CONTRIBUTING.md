This repo includes compilation support, tests, a validation workflow, publishing, and versioning guidance.  

Currently requires `node` version 16 to be installed on your machine. We should stuff this into a devcontainer at some point.

Install the dependencies  
```bash
$ npm install
```

Run the tests :heavy_check_mark:  
```bash
$ npm test
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

```bash
npm run prepare
git add dist
```

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

# Act

[nektos/act](https://github.com/nektos/act) is a tool for testing GitHub Actions locally.

After installing it, you can for example run the `test` job locally via

```bash
act -j test
```

To list available jobs, run

```bash
act push -l
```

to list all jobs that are executed on a push.
