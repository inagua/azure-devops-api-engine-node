const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Get work items matching given IDs.
 *
 * This step must be used with `.chain()` method because it makes a single call for a list of IDs.
 *
 * GET https://dev.azure.com/{organization}/{project}/_apis/wit/workitems?ids={ids}&api-version=5.1
 */
class ItemsForItemIdsStep extends Step {

    _org;
    _project;

    constructor(org, project) {
        super();
        this._org = org;
        this._project = project;
    }

    async doRun$(itemIds) {
        const idsCommaSeparated = itemIds.join(',');
        const res = await get$(this._org, this._project, `/_apis/wit/workitems?ids=${idsCommaSeparated}&api-version=5.1`);
        return res.data.value;
    }

}
module.exports.ItemsForItemIdsStep = ItemsForItemIdsStep;
