const {Step} = require('../engine/engine');


/**
 * Keep items having a field with the given value.
 */
class FilterFieldValueStep extends Step {

    _field;
    _value;

    constructor(field, value) {
        super();
        this._field = field;
        this._value = value;
    }

    async doRun$(item) {
        return item[this._field] === this._value;
    }

}
module.exports.FilterFieldValueStep = FilterFieldValueStep;
