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



describe.only('Items Service', function () {

    let item, updatesForStateChanges;

    beforeEach(async () => {
        item = {};
        updatesForStateChanges = [
            {
                "revisedDate": "2025-06-13T12:36:17.697Z",
                fields: {
                    "System.State": {"newValue": "00_New"},
                    "System.ChangedDate": {"newValue": "2025-06-13T12:27:03.003Z"},
                }
            },
            {
                "revisedDate": "2025-08-18T05:29:24.98Z",
                fields: {
                    "System.State": {
                        "oldValue": "00_New",
                        "newValue": "01_Ready to groom",
                    },
                    "System.ChangedDate": {
                        "oldValue": "2025-08-07T14:43:17.013Z",
                        "newValue": "2025-08-13T04:39:55.55Z"
                    },
                }
            },
            {
                "revisedDate": "2025-10-01T08:46:58.2Z",
                fields: {
                    "System.State": {
                        "oldValue": "01_Ready to groom",
                        "newValue": "02_Ready for sprint",
                    },
                    "System.ChangedDate": {
                        "oldValue": "2025-09-24T07:38:48.813Z",
                        "newValue": "2025-09-24T07:38:57.833Z",
                    },
                }
            },
            {
                "revisedDate": "2025-10-10T12:34:41.77Z",
                fields: {
                    "System.State": {
                        "oldValue": "02_Ready for sprint",
                        "newValue": "03_In dev",
                    },
                    "System.ChangedDate": {
                        "oldValue": "2025-09-24T07:38:57.833Z",
                        "newValue": "2025-10-01T08:46:58.2Z",
                    },
                }
            },
            {
                "revisedDate": "2025-10-13T06:37:33.293Z",
                fields: {
                    "System.State": {
                        "oldValue": "03_In dev",
                        "newValue": "04_Ready for test",
                    },
                    "System.ChangedDate": {
                        "oldValue": "2025-10-01T08:46:58.2Z",
                        "newValue": "2025-10-10T12:34:41.77Z",
                    },
                }
            },
            {
                "revisedDate": "2025-10-13T06:50:44.23Z",
                fields: {
                    "System.State": {
                        "oldValue": "04_Ready for test",
                        "newValue": "03_In dev",
                    },
                    "System.ChangedDate": {
                        "oldValue": "2025-10-10T12:34:41.77Z",
                        "newValue": "2025-10-13T06:37:33.293Z",
                    },
                }
            },
            {
                "revisedDate": "2025-10-14T04:43:01.3Z",
                fields: {
                    "System.State": {
                        "oldValue": "03_In dev",
                        "newValue": "04_Ready for test",
                    },
                    "System.ChangedDate": {
                        "oldValue": "2025-10-13T08:21:10.21Z",
                        "newValue": "2025-10-13T09:33:42.67Z",
                    },
                }
            },
            {
                "revisedDate": "2025-10-23T15:31:06.663Z",
                fields: {
                    "System.State": {
                        "oldValue": "04_Ready for test",
                        "newValue": "05_Ready for review",
                    },
                    "System.ChangedDate": {
                        "oldValue": "2025-10-23T09:00:34.207Z",
                        "newValue": "2025-10-23T13:47:03.29Z",
                    },
                }
            },
            {
                "revisedDate": "2025-10-24T06:02:56.593Z",
                fields: {
                    "System.State": {
                        "oldValue": "05_Ready for review",
                        "newValue": "Done",
                    },
                    "System.ChangedDate": {
                        "oldValue": "2025-10-23T13:47:03.29Z",
                        "newValue": "2025-10-23T15:31:06.663Z",
                    },
                }
            },
        ];

    });

    afterEach(async function () {
    });

    describe('.msInStateForUpdates()', function () {

        it('should successfully return the milliseconds spent in the provided state.', async function () {
            const ms = ItemsService.msInStateForUpdates(updatesForStateChanges);
            expect(ms).to.eql(801832947);

            const days = Math.trunc(ms / 1000 / 60 / 60 / 24);
            expect(days).to.eql(9);
        });

    });

    describe('.msInStateForUpdatesWithoutWE()', function () {

        it('should successfully return the milliseconds spent in the provided state, excluding weekend days.', async function () {
            const ms = ItemsService.msInStateForUpdatesWithoutWE(updatesForStateChanges);
            expect(ms).to.eql(629032947);

            const days = Math.trunc(ms / 1000 / 60 / 60 / 24);
            expect(days).to.eql(7);
        });

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
