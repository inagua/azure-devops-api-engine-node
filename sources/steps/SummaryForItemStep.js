const {Step} = require('../engine/engine');
const {Fields} = require("./constants");


/**
 * Keep only a few fields on the given work item.
 */
class SummaryForItemStep extends Step {

    async doRun$(item) {
        return {
            id: item.id,
            title: item.fields[Fields.Title],
            state: item.fields[Fields.State],
            changedDate: item.fields[Fields.ChangedDate],
            states: item.__states
        };
    }

}

module.exports.SummaryForItemStep = SummaryForItemStep;
