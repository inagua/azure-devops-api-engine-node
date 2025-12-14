const path = require("path");
const fs = require('node:fs');

const {Step} = require('../engine/engine');
const {Fields} = require("./constants");
const {ReporterHTML} = require("../services/reporter.html");
const {ReporterCSV} = require("../services/reporter.csv");
const {ItemsService} = require("../services/items.service");


const filenameWithTimestampAnd = (filename) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace colons and dots with hyphens
    return `${timestamp}-${filename}`;
}

const msPerDay = 1000 * 60 * 60 * 24;
const msToDays = (ms) => ms / msPerDay;
const msToDaysTrunc = (ms) => Math.trunc(msToDays(ms));

const toStateClass = (item) => {
    if (ItemsService.countOfInDevMoves(item)) return 'alert-green';
    return '';
};
const toExpectedText = (item) => {
    return Math.round(item.computed[Fields.Computed.ExpectedDays] || 0);
};
const toTrendClass = (item) => {
    if (item.computed[Fields.Computed.DaysTrend] != null && Math.abs(item.computed[Fields.Computed.DaysTrend]) < 10) return 'alert-green';
    if (item.computed[Fields.Computed.DaysTrend] > 20) return `alert-red`;
    if (item.computed[Fields.Computed.DaysTrend] < -20) return `alert-blue`;
    return '';
};
const toTrendText = (item) => {
    if (item.computed[Fields.Computed.DaysTrend] === 0) return '==';
    if (item.computed[Fields.Computed.DaysTrend] > 0) return `+${item.computed[Fields.Computed.DaysTrend]}%`;
    if (item.computed[Fields.Computed.DaysTrend]) return `${item.computed[Fields.Computed.DaysTrend]}%`;
    return '-';
};
const toMovesClass = (item) => {
    // if (item.computed[Fields.Computed.CountOfInDevMoves] === 1) return 'moves-ok';
    if (item.computed[Fields.Computed.CountOfInDevMoves] > 2) return `alert-red`;
    if (item.computed[Fields.Computed.CountOfInDevMoves] > 1) return 'alert-yellow';
    return '';
};
const toDelaysClass = (item) => {
    const count = item.iterations?.length || 0;
    if (count > 2) return `alert-red`;
    if (count > 1) return 'alert-yellow';
    return '';
};



/**
 * Generate reports on metrics (CSV, HTML).
 */
class ExportToMetricsReportsContextStep extends Step {

    constructor({htmlTemplatePath, htmlReportPath, htmlReportName} = {}) {
        super()
            .prerequisites(['organization', 'projectName', 'items'])
            .postrequisites([])
        ;
        this._htmlTemplatePath = htmlTemplatePath || path.resolve(__dirname, '../resources/report.html');
        // this._htmlReportName = htmlReportName || 'report.html';
        this._htmlReportPath = htmlReportPath || `./executions/${filenameWithTimestampAnd(htmlReportName || 'report.html')}`;
    }

    async doRun$(context) {

        const htmlReporter = new ReporterHTML()
            .header(`<th class="center">#</th>`)
            .header(`<th class="center">ID</th>`)
            .header(`<th>Type</th>`)
            .header(`<th>Title</th>`)
            .header(`<th>State</th>`)
            .header(`<th class="right" title="Value of the Effort field in Azure DevOps, in Story Points">Estimation (SP)</th>`)
            .header(`<th class="right" title="Expected duration in Days, based on the Effort and the average rate of the work items having development completed">Expected (Days)</th>`)
            .header(`<th class="right" title="Actual duration, count of days spent in development. Becarful, this value will change if the work item is still in dev.">In Dev (Days)</th>`)
            .header(`<th class="right" title="Gap between the Expected Duration and the Actual duration">Gap (%)</th>`)
            .header(`<th class="right" title="Number of times the work item has been in development">In Dev (Moves to)</th>`)
            .header(`<th class="right" title="Number of times the work item has been moved to another sprint">Delays (sprints)</th>`)
        ;

        const csvReporter = new ReporterCSV()
            .headers(['#', 'ID','TYPE', 'TITLE', 'STATE', 'ESTIMATION (SP)', 'EXPECTED (Days)', 'In Dev (Days)', 'GAP (%)', 'MOVES TO DEV', 'DELAYS (Sprints)']);

        context.items.map((item, i) => {
            htmlReporter
                .cell(`<td class="center">${i + 1}</td>`)
                .cell(`<td class="center">${item.id}</td>`)
                .cell(`<td>${item.fields['System.WorkItemType']}</td>`)
                .cell(`<td><a href="https://dev.azure.com/${context.organization}/${context.projectName}/_workitems/edit/${item.id}" target="_blank">${item.fields['System.Title']}</a></td>`)
                .cell(`<td class="${toStateClass(item)}"><code>${item.fields[Fields.State]}</code></td>`)
                .cell(`<td class="right">${item.fields[Fields.Effort] || '0'}</td><!-- EFFORT -->`)
                .cell(`<td class="right" title="Coeff: ${item.computed[Fields.Computed.CoeffInDays]}">${toExpectedText(item)}</td><!-- EXPECTED -->`)
                .cell(`<td class="right">${msToDaysTrunc(item.inDevMs)}</td><!-- IN DEV DURATION -->`)
                .cell(`<td class="right ${toTrendClass(item)}" title="">${toTrendText(item)}</td><!-- TREND -->`)
                .cell(`<td class="right ${toMovesClass(item)}">${item.computed[Fields.Computed.CountOfInDevMoves]}</td><!-- IN DEV TRANSITIONS COUNT -->`)
                .cell(`<td class="right ${toDelaysClass(item)}" title="${item.iterations.join('\n')}">${item.iterations?.length || '-'}</td><!-- IN DEV TRANSITIONS COUNT -->`)
                .row();

            csvReporter
                .cell(`${i + 1}`)
                .cell(`${item.id}`)
                .cell(`${item.fields['System.WorkItemType']}`)
                .cell(`${item.fields['System.Title']}`)
                .cell(`${item.fields[Fields.State]}`)
                .cell(`${item.fields[Fields.Effort] || 0}`)
                .cell(`${toExpectedText(item)}`)
                .cell(`${msToDaysTrunc(item.inDevMs)}`)
                .cell(`${toTrendText(item)}`)
                .cell(`${item.computed[Fields.Computed.CountOfInDevMoves]}`)
                .cell(`${item.iterations?.length || 0}`)
                .row();

        });

        // const today = new Date().toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric'});
        const now = new Date().toLocaleString(undefined, {dateStyle: 'full', timeStyle: 'long'});
        const toDate = (d) => new Date(d).toLocaleString(undefined, {dateStyle: 'short'});
        const dates = context.iteration?.attributes;
        const iteration = context.iteration && (`${context.iteration.name} (${toDate(dates.startDate)} to ${toDate(dates.finishDate)})`) || context.iterationName || 'Current sprint';
        htmlReporter
            .replace('<!-- TODO_TITLE -->', `${iteration} - Work items`)
            .replace('<!-- TODO_DATE -->', `Date: ${now}`)
        ;
        if (context.projectCode) htmlReporter.replace('<!-- TODO_PROJECT_CODE -->', context.projectCode);
        if (context.projectTitle) htmlReporter.replace('<!-- TODO_PROJECT_NAME -->', context.projectTitle);
        htmlReporter
            .filePath(this._htmlReportPath) // const reportPath = `./executions/${filenameWithTimestampAnd(this._htmlReportName)}`;
            .templatePath(this._htmlTemplatePath)
            .generate()
        ;

        csvReporter
            .filePath(this._htmlReportPath + '.csv')
            .generate()
        ;

        return context;
    }

}

module.exports.ExportToMetricsReportsContextStep = ExportToMetricsReportsContextStep;
