const {Step} = require('../engine/engine');
const {Items} = require("../api/items.api");
const {Fields} = require("./constants");


/**
 * Get the Updates and the State Updates for the given Items.
 * 
 */
class UpdatesForItemIdsContextStep extends Step {

    constructor() {
        super()
            .prerequisites(['organization', 'projectName', 'workItemIds'])
            .postrequisites(['items']) // item.updates, item.stateUpdates, item.inDevStateUpdates
        ;
    }

    async doRun$(context) {
        const {organization, projectName, workItemIds, items} = context;
        for (const itemId of workItemIds) {
            const item = items.find(i => i.id === itemId) || {};
            if (!item.id) {
                item.id = itemId;
                context.items.push(item);
            }
            item.updates = await Items.updatesForItemId$(organization, projectName, itemId);
            item.stateUpdates = item.updates.filter(u => u?.fields && !!u.fields[Fields.State]);
            item.inDevStateUpdates = item.updates.filter(u => u?.fields && !!u.fields[Fields.State] && u.fields[Fields.State].newValue === Fields.States.InDev);
            item.inDevMs = Items.stateMSForUpdates(item.updates);
        }
        return context;
    }

}
module.exports.UpdatesForItemIdsContextStep = UpdatesForItemIdsContextStep;
