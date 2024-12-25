const {Step} = require('../engine/engine');


/**
 * Add a boolean field `__stateWentBack` on the given work item, with true value if at least once the work item went back
 * in the sequence of its successive state changes.
 */
class StateWentBackForItemStep extends Step {

    async doRun$(item) {
        const __states = item.__states || [];
        let previous;
        let __stateWentBack;
        __states.forEach(state => {
            __stateWentBack = __stateWentBack || (previous && previous[0] === '0' && state.state[0] === '0' && previous > state.state);
            previous = state.state;
        });
        return {
            ...item,
            __stateWentBack,
        };
    }

}

module.exports.StateWentBackForItemStep = StateWentBackForItemStep;
