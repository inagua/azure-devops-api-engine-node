class Step {

    _steps = [];
    _prerequisites = [];
    _postrequisites = [];

    prerequisites(fields) {
        this._prerequisites = fields || [];
        return this;
    }

    postrequisites(fields) {
        this._postrequisites = fields || [];
        return this;
    }

    doRun$(context) {
        return context;
    }

    name() {
        return this.constructor.name;
    }

    _checkPrerequisites(context) {
        this._prerequisites.forEach(field => {
            if (!context[field] && context[field] !== false && context[field] !== 0) throw new Error(`Missing field in the Context: Field=${field} Step=${this.name()}`);
        });
        return context;
    }

    _checkPostrequisites(result) {
        this._postrequisites.forEach(field => {
            if (!result[field] && result[field] !== false && result[field] !== 0) throw new Error(`Missing field in the Result. Field=${field} Step=${this.name()}`);
        });
        return result;
    }

    async run$(context) {
        this._checkPrerequisites(context);
        const result = await this.doRun$(context);
        this._checkPostrequisites(result);

        console.log('>> Step DONE:', this.name());

        return this._steps.reduce(
            async (outputs, step) => {
                const _outputs = await outputs;
                // console.log('>>>>> acc=', step.step.constructor.name, _outputs)
                try {
                    if (step.type === 'chain') return await step.step.run$(_outputs);

                    if (step.type === 'map') {
                        const results = [];
                        for await (let output of _outputs) {
                            const r = await step.step.run$(output);
                            results.push(r);
                        }
                        return results;
                    }
    
                    if (step.type === 'filter') {
                        const results = [];
                        for await (let output of _outputs) {
                            const r = await step.step.run$(output);
                            if (r) {
                                results.push(output);
                            }
                        }
                        return results;
                    }
    
                } catch (e) {
                    console.error('>> ERROR=', e);
                    throw 'ERROR!';
                }
            },
            result
        );
    }

    chain(next) {
        this._steps.push({
            step: next,
            type: 'chain'
        });
        return this;
    }

    map(next) {
        this._steps.push({
            step: next,
            type: 'map'
        })
        return this;
    }

    filter(next) {
        this._steps.push({
            step: next,
            type: 'filter'
        })
        return this;
    }
}

module.exports.Step = Step;
