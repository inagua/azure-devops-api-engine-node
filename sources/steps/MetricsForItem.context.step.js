const {Step} = require('../engine/engine');
const {Fields} = require("./constants");
const {ItemsService} = require("../services/items.service");


/**
 * Get the Updates and the State Updates for the given Items.
 * 
 */
class MetricsForItemContextStep extends Step {

    constructor() {
        super()
            .prerequisites(['items'])
            // .postrequisites(['items']) // item.updates, item.stateUpdates, item.inDevStateUpdates
        ;
    }

    async doRun$(context) {
        const expectedDaysForEffort = (effort) => effort * coeffDays;
        const msPerDay = 1000 * 60 * 60 * 24;
        const msToDays = (ms) => ms / msPerDay;

        let coeffsSum = 0;
        let coeffsCount = 0;
        context.items.forEach(item => {
            const effort = item.fields[Fields.Effort];
            const inDevMs = item.inDevMs;
            if (ItemsService.isDevCompleted(item) && effort && inDevMs) {
                // totalEffort += effort;
                // totalMs += inDevMs;
                coeffsSum += inDevMs / effort;
                coeffsCount++;
                // console.log('>>>>>', inDevMs, effort, inDevMs / effort, coeffsSum);
            }
        });

        const coeffMs = coeffsCount ? coeffsSum / coeffsCount : 0;
        const coeffDays = msToDays(coeffMs);

        context.items.forEach((item, i) => {
            item.computed = {};
            item.computed[Fields.Computed.ExpectedDays] = expectedDaysForEffort(item.fields[Fields.Effort]);
            item.computed[Fields.Computed.DaysTrend] = item.computed[Fields.Computed.ExpectedDays] === 0 ? null : Math.trunc((msToDays(item.inDevMs) - expectedDaysForEffort(item.fields[Fields.Effort]))/expectedDaysForEffort(item.fields[Fields.Effort])*100);
            item.computed[Fields.Computed.CountOfInDevMoves] = ItemsService.countOfInDevMoves(item);
            item.computed[Fields.Computed.CoeffInDays] = coeffDays;
        });

        return context;
    }

}
module.exports.MetricsForItemContextStep = MetricsForItemContextStep;
