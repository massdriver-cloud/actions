This repo includes compilation support, tests, a validation workflow, publishing, and versioning guidance.

Currently requires `node` version 16 to be installed on your machine. We should stuff this into a devcontainer at some point.

Install the dependencies

```bash
$ npm install
```

To build the typescript and package it for distribution:

```bash
$ npm run build && npm run package
```
