/**
 * Created by jacques on 25.12.2024.
 */

// http://code.tutsplus.com/tutorials/http-mock-testing-in-nodejs--cms-22836
// const _ = require('lodash');
// const moment = require('moment');

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect; // we are using the "expect" style of Chai

const {Step} = require('./engine');

class FetchListStep extends Step {
    async doRun$() {
        return ['a', 'b', 'c'];
    }
}

class ConcatListStep extends Step {
    async doRun$(input) {
        return input.concat(['d', 'e']);
    }
}

class AppendItemStep extends Step {
    async doRun$(input) {
        return `${input}-10`;
    }
}

class FilterListStep extends Step {
    async doRun$(input) {
        return input.indexOf('b') > -1 || input.indexOf('d') > -1;
    }
}


describe('Engine', function () {

    beforeEach(async () => {
    });

    afterEach(async function () {
    });

    describe('.run$()', function () {

        it('should successfully run a single step', async function () {
            const workflow = new FetchListStep();
            expect(await workflow.run$()).to.eql(['a', 'b', 'c']);
        });

        it('should successfully run a chained step', async function () {
            const workflow = new FetchListStep()
                .chain(new ConcatListStep())
            ;
            expect(await workflow.run$()).to.eql(['a', 'b', 'c', 'd', 'e']);
        });

        it('should successfully run a mapped step', async function () {
            const workflow = new FetchListStep()
                .chain(new ConcatListStep())
                .map(new AppendItemStep())
            ;
            expect(await workflow.run$()).to.eql(['a-10', 'b-10', 'c-10', 'd-10', 'e-10']);
        });

        it('should successfully run a filtered step', async function () {
            const workflow = new FetchListStep()
                .chain(new ConcatListStep())
                .map(new AppendItemStep())
                .filter(new FilterListStep())
            ;
            expect(await workflow.run$()).to.eql(['b-10', 'd-10']);
        });

    });

});
