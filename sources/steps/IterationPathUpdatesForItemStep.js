const { IterationPathUpdatesForItemIdStep } = require('./IterationPathUpdatesForItemIdStep');
const { Fields } = require("./constants");


/**
 * Return `Updates` resources concerning only the IterationPath of the given work item.
 */
class IterationPathUpdatesForItemStep extends IterationPathUpdatesForItemIdStep {

    constructor(org, project) {
        super(org, project);
    }

    async doRun$(item) {
        const __iterationPathUpdates = await super.doRun$(item.id);
        const __iterationPaths = __iterationPathUpdates.map(u => ({
            date: u.revisedDate,
            iterationPath: u.fields[Fields.IterationPath].newValue
        }));

        const __iterations = __iterationPaths.reduce((acc, p) => {
            acc = acc.filter(_p => p.iterationPath.indexOf(_p) === -1);
            if (!acc.find(_p => p.iterationPath.indexOf(_p) === 0)) {
                acc.push(p.iterationPath);
            }
            return acc;
        }, []);
        const __itemSlided = __iterations.length > 1;

        return {
            ...item,
            // __iterationPathUpdates,
            // __iterationPaths,
            __iterations,
            __itemSlided,
        };
    }

}

module.exports.IterationPathUpdatesForItemStep = IterationPathUpdatesForItemStep;
