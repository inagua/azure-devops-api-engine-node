const moment = require('moment');
const { get$ } = require("../steps/ado.api");
const { Fields } = require("../steps/constants");


/**
 * GET https://dev.azure.com/my-org/my-project/_apis/wit/workitems/2886588/updates?api-version=7.1
 *
 * @param organization
 * @param projectCode
 * @param itemId
 * @returns {Promise<*>}
 */
const updatesForItemId$ = async (organization, projectCode, itemId) => {
    const { data } = await get$(organization, projectCode, `/_apis/wit/workItems/${itemId}/updates?api-version=5.1`);
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

// https://momentjs.com/docs/#/durations/days/
const stateMSForRevisions = (revisions, expectedState = Fields.States.InDev) => {
    let inProgressStart = null;
    let totalDuration = 0;

    for (const rev of revisions) {
        const state = rev.fields[Fields.State];
        const changedDate = moment(rev.fields[Fields.ChangedDate]);

        if (state === expectedState && !inProgressStart) {
            inProgressStart = changedDate;
        } else if (state !== expectedState && inProgressStart) {
            totalDuration += moment.duration(changedDate.diff(inProgressStart)).asMilliseconds();
            inProgressStart = null;
        }
    }

    // If still in progress at the end
    if (inProgressStart) {
        totalDuration += moment.duration(moment().diff(inProgressStart)).asMilliseconds();
    }

    return totalDuration; //.toFixed(2);
}

const stateMSForUpdates = (updates, expectedState = Fields.States.InDev) => {
    let inProgressStart = null;
    let totalMs = 0;

    for (const update of updates) {
        const stateChange = update.fields?.[Fields.State];

        if (stateChange) {
            const changedDate = new Date(update.fields?.[Fields.ChangedDate]?.newValue || update.revisedDate);

            if (stateChange?.newValue === expectedState && !inProgressStart) {
                inProgressStart = changedDate;
            } else if (stateChange?.newValue !== expectedState && inProgressStart) {
                totalMs += changedDate - inProgressStart;
                inProgressStart = null;
            }
        }
    }

    // If still in progress at the end
    if (inProgressStart) {
        totalMs += new Date() - inProgressStart;
    }

    // const days = totalMs / (1000 * 60 * 60 * 24);
    // return days.toFixed(2);
    return totalMs; //.toFixed(2);
}

module.exports.Items = {
    updatesForItemId$,
    revisionsForItemId$,
    stateMSForRevisions,
    stateMSForUpdates,
}
