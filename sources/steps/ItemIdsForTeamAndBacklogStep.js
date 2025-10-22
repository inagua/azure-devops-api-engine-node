const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Get the IDs of the work items included in a given backlog for a given team.
 *
 * https://dev.azure.com/my-org/my-project/64ac4b0d-dc0f-4561-b61d-6fce811bf733/_apis/work/backlogs?api-version=7.1
 * https://dev.azure.com/my-org/my-project/64ac4b0d-dc0f-4561-b61d-6fce811bf733/_apis/work/backlogs/Microsoft.RequirementCategory/workItems?api-version=7.1
 */
class ItemIdsForTeamAndBacklogStep extends Step {

    constructor() {
        super()
            .prerequisites(['organization', 'projectName', 'teamId', 'backlogId'])
            .postrequisites(['workItemIds'])
        ;
    }

    async doRun$(context) {
        const {data} = await get$(context.organization, context.projectName, `/${context.teamId}/_apis/work/backlogs/${context.backlogId}/workItems?api-version=7.1`);
        context.workItemIds = data.workItems.map(i => i.target.id);
        return context;
    }

}
module.exports.ItemIdsForTeamAndBacklogStep = ItemIdsForTeamAndBacklogStep;
