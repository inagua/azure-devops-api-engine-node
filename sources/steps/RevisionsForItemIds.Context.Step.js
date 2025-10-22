const {Step} = require('../engine/engine');
const {Items} = require("../api/items.api");
const {Fields} = require("./constants");


/**
 * Get the Revisions and the State Revisions for the given Items.
 * 
 */
class RevisionsForItemIdsContextStep extends Step {

    constructor() {
        super()
            .prerequisites(['organization', 'projectName', 'workItemIds'])
            .postrequisites(['items']) // item.revisions, item.stateRevisions, item.inDevStateRevisions, item.msInDev
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
            item.revisions = await Items.revisionsForItemId$(organization, projectName, itemId);
            item.stateRevisions = item.revisions.filter(u => u?.fields && !!u.fields[Fields.State]);
            item.inDevStateRevisions = item.revisions.filter(u => u?.fields && u.fields[Fields.State] === Fields.States.InDev);
            item.inDevMs = Items.stateMSForRevisions(item.revisions);
        }
        return context;
    }

}
module.exports.RevisionsForItemIdsContextStep = RevisionsForItemIdsContextStep;
