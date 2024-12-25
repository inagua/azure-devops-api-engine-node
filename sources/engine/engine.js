class Step {

    _steps = [];

    doRun$(context) {
        return context;
    }

    async run$(context) {
        const result = await this.doRun$(context);
        return this._steps.reduce(
            async (outputs, step) => {
                const _outputs = await outputs;
                // console.log('>>>>> acc=', step.step.constructor.name, _outputs)
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
