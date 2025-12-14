const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Get an Iteration and its ID from its name, for a given Project name amd Team ID.
 *
 * If the Iteration name is omitted, the current Iteration will be searched.
 * If the search is made with an ID, the _links property is available.
 * 
 * https://learn.microsoft.com/en-us/rest/api/azure/devops/work/iterations/get?view=azure-devops-rest-7.1&tabs=HTTP#teamsettingsiteration
 *
 * Example:
 * {
 *      "count": 105,
 *      "value": [
 *          {
 *              "id": "...",
 *              "name": "Sprint 1",
 *              "path": "my-project\\Sprint 1",
 *              "attributes": {
 *                  "startDate": "2020-07-22T00:00:00Z",
 *                  "finishDate": "2020-08-11T00:00:00Z",
 *                  "timeFrame": "past"
 *              },
 *          "url": "https://dev.azure.com/my-org/my-project/my-team/_apis/work/teamsettings/iterations/1fdf21b7-3929-42a0-a26e-b1c3f5e51e97"
 *          },
 *      ]
 * }
 */
class IterationForNameAndTeamIdStep extends Step {

    constructor() {
        super()
            .prerequisites(['projectName', 'teamId']) // Optional: iterationName
            .postrequisites(['iteration', 'iterationId'])
        ;
    }

    async doRun$(context) {
        const {data} = await get$(context.organization, context.projectName, `/${context.teamId}/_apis/work/teamsettings/iterations?api-version=7.1`, context.credentials);
        if (context.iterationName) {
            const iterations = data.value.filter(iteration => iteration.name === context.iterationName);
            if (iterations.length > 1) throw new Error(`Several Iterations found for name: ${context.iterationName}`);
            if (iterations.length === 1) context.iteration = iterations[0];
        } else {
            context.iteration = data.value.find(iteration => iteration?.attributes?.timeFrame === 'current');
        }
        if (!context.iteration) throw new Error(`No Iteration found for name: ${context.iterationName || 'current'}`);
        context.iterationId = context.iteration.id;
        return context;
    }

}

module.exports.IterationForNameAndTeamIdStep = IterationForNameAndTeamIdStep;
