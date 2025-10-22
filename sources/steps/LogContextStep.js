const {Step} = require('../engine/engine');


/**
 * Log the context.
 */
class LogContextStep extends Step {

    async doRun$(context) {
        // console.log(context);
        console.log('>>>>> CONTEXT:', require('util').inspect(context, {showHidden: false, depth: null}));
        return context;
    }

}

module.exports.LogContextStep = LogContextStep;
