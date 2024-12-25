# Tool to query Azure DevOps API in Node JS

> This tool aims at fetching data from the Azure DevOps Web API and handle them to get advanced informations.


## Modules

This tool was designed to facilitate the learning and the reuse by defining some steps that can be chained, mapped or filtered.

There are 3 modules:
1. The `./sources/engine` itself that defines the `step` and allows to `chain`, `map` or `filter` the steps.
2. The `./sources/steps` folder with all the already defined steps to fetch work items for example
3. The `./scripts` folder containing one file per requirement, and can be used as documentation


## Run unit tests

Once:
```shell
npm run test
```

As continuous testing:
```shell
npm run test:watch
```

## Setup

This tool is a Node JS library:
1. Use an environment configured for Node JS (`TODO`)
2. From a terminal: `npm i`
3. Set your own credential in the file: `./credentials.js` ( `TODO`)
4. Create your own script with constants in the folder: `./scripts/`
5. Run the script: `node ./scirpts/your-own-script.js`


## Write your script

Inspired by the existing ones, you have to write your requirement as a script combining the steps and the inputs (IDs).


## Utilities

The Azure DevOps web API works with IDs for the requested entities.

Some of them are available in the URL of your browser when you use Azure Devops portal: organization, project, work item...

But some others are not available and must be requested from the API: team, sprint...
