const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Get work items matching given IDs.
 *
 * This step must be used with `.chain()` method because it makes a single call for a list of IDs.
 *
 * GET https://dev.azure.com/{organization}/{project}/_apis/wit/workitems?ids={ids}&api-version=5.1
 */
class ItemsForItemIdsContextStep extends Step {

    constructor() {
        super()
            .prerequisites(['organization', 'projectName', 'workItemIds'])
            .postrequisites(['items'])
        ;
    }

    async doRun$(context) {
        const {organization, projectName} = context;
        const idsCommaSeparated = context.workItemIds.join(',');
        const res = await get$(organization, projectName, `/_apis/wit/workitems?ids=${idsCommaSeparated}&api-version=5.1`);
        context.items = res.data.value;
        return context;
    }

}
module.exports.ItemsForItemIdsContextStep = ItemsForItemIdsContextStep;
