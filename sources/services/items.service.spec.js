/**
 * Created by jacques on 12.12.2025.
 */

// http://code.tutsplus.com/tutorials/http-mock-testing-in-nodejs--cms-22836
// const _ = require('lodash');
// const moment = require('moment');

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect; // we are using the "expect" style of Chai

const {ItemsService} = require('./items.service');



describe('Items Service', function () {

    let item;

    beforeEach(async () => {
        item = {};
    });

    afterEach(async function () {
    });

    describe('.iterationsForUpdates()', function () {

        it('should successfully return uniq iterationPath, removing ones starting others.', async function () {

            const updates = [
                { fields: {"System.IterationPath": { "newValue": "Container_Rental" }} },
                { fields: {"System.IterationPath": { "oldValue": "Container_Rental", "newValue": "Container_Rental\\Sprint 140" }} },
                { fields: {"System.IterationPath": { "oldValue": "Container_Rental\\Sprint 140", "newValue": "Container_Rental\\Sprint 141" }} },
                { fields: {"System.IterationPath": { "oldValue": "Container_Rental\\Sprint 141", "newValue": "Container_Rental\\Sprint 142" }} },
            ]

            const iterations = ItemsService.iterationsForUpdates(updates);
            expect(iterations).to.eql([
                'Container_Rental\\Sprint 140',
                'Container_Rental\\Sprint 141',
                'Container_Rental\\Sprint 142',
            ]);
        });

    });

});
