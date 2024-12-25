const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Return `Updates` resources of the given work item ID.
 *
 * https://dev.azure.com/{organization}/{project}/_apis/wit/workItems/1798358/updates?api-version=5.1
 *
 * {
 *     id: 1,
 *     workItemId: 2529915,
 *     rev: 1,
 *     revisedBy: [Object],
 *     revisedDate: '2024-12-17T11:18:22.62Z',
 *     fields: [Object],
 *     url: 'https://dev.azure.com/{organization}/983b149e-bffd-4174-8e79-181493394e0b/_apis/wit/workItems/2529915/updates/1'
 * }
 */
class UpdatesForItemIdStep extends Step {

    _org;
    _project;

    constructor(org, project) {
        super();
        this._org = org;
        this._project = project;
    }

    async doRun$(itemId) {
        const o = await get$(this._org, this._project, `/_apis/wit/workItems/${itemId}/updates?api-version=5.1`);
        return o.data.value; // {id, rev, fields, url}[]
    }
}

module.exports.UpdatesForItemIdStep = UpdatesForItemIdStep;
