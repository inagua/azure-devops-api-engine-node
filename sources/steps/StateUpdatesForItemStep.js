const {StateUpdatesForItemIdStep} = require('./StateUpdatesForItemIdStep');
const {Fields} = require("./constants");


/**
 * Return `Updates` resources concerning only the state of the given work item.
 */
class StateUpdatesForItemStep extends StateUpdatesForItemIdStep {

    constructor(org, project) {
        super(org, project);
    }

    async doRun$(item) {
        const __stateUpdates = await super.doRun$(item.id);
        const __states = __stateUpdates.map(u => ({
            date: u.revisedDate,
            state: u.fields[Fields.State].newValue
        }));
        return {
            ...item,
            __stateUpdates,
            __states
        };
    }

}

module.exports.StateUpdatesForItemStep = StateUpdatesForItemStep;
