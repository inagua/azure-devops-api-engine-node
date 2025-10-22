const {Step} = require('../engine/engine');
const {post$} = require("./ado.api");


/**
 * Get work items matching given IDs.
 *
 * This step must be used with `.chain()` method because it makes a single call for a list of IDs.
 *
 * Docuementation: https://learn.microsoft.com/en-us/rest/api/azure/devops/search/codesearchresults?view=azure-devops-rest-7.1
 * 
 * GET https://dev.azure.com/{organization}/{project}/_apis/search/codesearchresults?api-version=7.1
 */
class SearchForOrgStep extends Step {

    _org;
    _searchText;

    constructor(org, searchText) {
        super();
        this._org = org;
        this._searchText = searchText;
    }

    async doRun$() {
        const res = await post$(this._org, '', `/_apis/search/codesearchresults?api-version=7.1`, {
            "searchText": this._searchText,
            "$top": 16,
        });
        return res.data;
    }

}
module.exports.SearchForOrgStep = SearchForOrgStep;
