const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Get the IDs of the work items included in a given sprint for a given team.
 *
 * https://learn.microsoft.com/en-us/rest/api/azure/devops/work/iterations/get-iteration-work-items?view=azure-devops-rest-7.1&tabs=HTTP
 */
class ItemIdsForTeamAndSprintContextStep extends Step {

    constructor() {
        super()
            .prerequisites(['organization', 'projectName', 'teamName', 'iterationId'])
            .postrequisites(['workItemIds'])
        ;
    }

    async doRun$(context) {
        const {organization, projectName, teamName, iterationId} = context;
        const res = await get$(organization, projectName, `/${teamName}/_apis/work/teamsettings/iterations/${iterationId}/workitems?api-version=7.1`);
        context.workItemIds = res.data.workItemRelations.filter(i => !i.rel).map(i => i.target.id);
        // context.workItemIds = [2996477];
        return context;
    }

}
module.exports.ItemIdsForTeamAndSprintContextStep = ItemIdsForTeamAndSprintContextStep;
