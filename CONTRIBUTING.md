The devContainer will get you set up with node.

Everything else is done via npm/the Makefile.

`make install` will update your dependencies.

## Building the Actions

`make build` will build any changes to the actions.
This changes the files in the `dist` folder corresponding to the edited action.

A GHA will fail if the `dist` folder is not up to date.

## Adding an Action

* create a file <<action_name>>/action.yml
* create a file src/<<action_name>>.ts for the implementation
* amend `scripts.build` in package.json to include the new action
