const moment = require('moment');
const { get$ } = require("../steps/ado.api");


/**
 * GET https://dev.azure.com/my-org/my-project/_apis/wit/workitems/2886588/updates?api-version=7.1
 *
 * @param organization
 * @param projectCode
 * @param itemId
 * @param credentials
 * @returns {Promise<*>}
 */
const updatesForItemId$ = async (organization, projectCode, itemId, credentials) => {
    const { data } = await get$(organization, projectCode, `/_apis/wit/workItems/${itemId}/updates?api-version=5.1`, credentials);
    return data.value; // {id, rev, fields, url}[]
}

/**
 * GET https://dev.azure.com/my-org/my-project/_apis/wit/workitems/2886588/revisions?api-version=7.1
 *
 * @param organization
 * @param projectCode
 * @param itemId
 * @returns {Promise<*>}
 */
const revisionsForItemId$ = async (organization, projectCode, itemId) => {
    // const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workItems/${workItemId}/revisions?api-version=7.0`;
    const { data } = await get$(organization, projectCode, `/_apis/wit/workItems/${itemId}/revisions?api-version=5.1`);
    return data.value; // {id, rev, fields, url}[]
}

module.exports.Items = {
    updatesForItemId$,
    revisionsForItemId$,
}
