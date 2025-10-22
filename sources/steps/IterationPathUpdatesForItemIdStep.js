const {UpdatesForItemIdStep} = require('./UpdatesForItemIdStep');
const {Fields} = require("./constants");


/**
 * Return `Updates` resources concerning only the state of the given work item ID.
 */
class IterationPathUpdatesForItemIdStep extends UpdatesForItemIdStep {

    constructor(org, project) {
        super(org, project);
    }

    async doRun$(itemId) {
        const updates = await super.doRun$(itemId);

        // 'System.State': { oldValue: '01_Ready to groom', newValue: '02_Ready for sprint' }
        return updates.filter(u => u?.fields && !!u.fields[Fields.IterationPath]);
    }

}

module.exports.IterationPathUpdatesForItemIdStep = IterationPathUpdatesForItemIdStep;
