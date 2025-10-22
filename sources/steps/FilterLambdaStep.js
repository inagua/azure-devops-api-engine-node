const {Step} = require('../engine/engine');


/**
 * Keep items having a field with the given value.
 */
class FilterLambdaStep extends Step {

    _field;
    _value;

    constructor(lambda) {
        super();
        this._lambda = lambda;
    }

    async doRun$(item) {
        return this._lambda(item);
    }

}
module.exports.FilterLambdaStep = FilterLambdaStep;
