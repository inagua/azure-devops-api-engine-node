const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Get an Iteration and its ID from its name, for a given Project name amd Team ID.
 *
 * If the Iteration name is omitted, the current Iteration will be search.
 * 
 * https://dev.azure.com/my-org/_apis/projects/my-project/teams?api-version=7.1
 */
class IterationForNameAndTeamIdStep extends Step {

    constructor() {
        super()
            .prerequisites(['projectName', 'teamId']) // Optional: iterationName
            .postrequisites(['iteration', 'iterationId'])
        ;
    }

    async doRun$(context) {
        const {data} = await get$(context.organization, context.projectName, `/${context.teamId}/_apis/work/teamsettings/iterations?api-version=7.1`);
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
