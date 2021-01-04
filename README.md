# Clean up old Package Versions

This is a github action based largely on the public action [delete-package-versions](https://github.com/marketplace/actions/delete-package-versions)([source](https://github.com/actions/delete-package-versions))

It is meant to be triggered by a github pull request closed action. When triggered, search the github graphql API for recent versions and loop over those to check if they match the input `branch`. Send the matching IDs back to the API with a delete mutation with that ID to clean up other versions.

The branch passed in can be the github branch directly. I'll downcase it and replace anything that isn't a letter, number, dash, or period with a dash to try to find the new version: 
`jk/9709/create_github_action` will become `jk-9709-create-github-action` and then the version is checked with `indexOf()`, so `0.8.8-jk-9709-create-github-action.1` will match. 

## Contributing

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

### Entrypoint
The entrypoint is main.ts

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

### action.yml
The action.yml contains the definition of the inputs and output for this action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)


## Usage:

After testing you can [create a version tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action. 
