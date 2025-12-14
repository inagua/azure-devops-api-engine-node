const path = require("path");
const fs = require('node:fs');

const {Step} = require('../engine/engine');
const {Fields} = require("./constants");
const {ItemsService} = require("../services/items.service");


const filenameWithTimestampAnd = (filename) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace colons and dots with hyphens
    return `${timestamp}-${filename}`;
}

const msPerDay = 1000 * 60 * 60 * 24;
const msToDays = (ms) => ms / msPerDay;
const msToDaysTrunc = (ms) => Math.trunc(msToDays(ms));

const csvSep = ',';
const csvEOL = '\n';


/**
 * Generate an HTML report.
 */
class ExportToHTMLContextStep extends Step {

    constructor({htmlTemplatePath, htmlReportPath, htmlReportName} = {}) {
        super()
            .prerequisites(['projectName'])
            .postrequisites([])
        ;
        this._htmlTemplatePath = htmlTemplatePath || path.resolve(__dirname, '../resources/report.html');
        // this._htmlReportName = htmlReportName || 'report.html';
        this._htmlReportPath = htmlReportPath || `./executions/${filenameWithTimestampAnd(htmlReportName || 'report.html')}`;
    }

    async doRun$(context) {
        // const {report} = context; // {headers: [], rows: [{}]}

        let reportHtmlContent = fs.readFileSync(this._htmlTemplatePath, 'utf8');

        const today = new Date().toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric'});

        // const headers = report.headers.map(header => `<th>${header}</th>`).join('\n        ');
        const headers = `
          <th class="center">#</th>
          <th class="center">ID</th>
          <th>Type</th>
          <th>Title</th>
          <th>State</th>
          <th class="right" title="Value of the Effort field in Azure DevOps, in Story Points">Estimation (SP)</th>
          <th class="right" title="Expected duration in Days, based on the Effort and the average rate of the work items having development completed">Expected (Days)</th>
          <th class="right" title="Actual duration, count of days spent in development. Becarful, this value will change if the work item is still in dev.">In Dev (Days)</th>
          <th class="right" title="Gap between the Expected Duration and the Actual duration">Gap (%)</th>
          <th class="right" title="Number of times the work item has been in development">In Dev (Moves to)</th>
          <th class="right" title="Number of times the work item has been moved to another sprint">Delays (sprints)</th>
        `;
        const csvHeader = ['#', 'ID','TYPE', 'TITLE', 'STATE', 'ESTIMATION (SP)', 'EXPECTED (Days)', 'In Dev (Days)', 'GAP (%)', 'MOVES TO DEV', 'DELAYS (Sprints)'].join(csvSep) + csvEOL;

        const toStateClass = (item) => {
          if (ItemsService.isDevCompleted(item)) return 'alert-green';
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
          return '';
        };

        const rows = context.items.map((item, i) => (`
          <tr>
            <td class="center">${i + 1}</td>
            <td class="center">${item.id}</td>
            <td>${item.fields['System.WorkItemType']}</td>
            <td><a href="https://dev.azure.com/${context.organization}/${context.projectName}/_workitems/edit/${item.id}" target="_blank">${item.fields['System.Title']}</a></td>
            <td class="${toStateClass(item)}"><code>${item.fields[Fields.State]}</code></td>
            <td class="right">${item.fields[Fields.Effort] || '0'}</td><!-- EFFORT --> 
            <td class="right" title="Coeff: ${coeffDays}">${toExpectedText(item)}</td><!-- EXPECTED --> 
            <td class="right">${msToDaysTrunc(item.inDevMs)}</td><!-- IN DEV DURATION -->
            <td class="right ${toTrendClass(item)}" title="">${toTrendText(item)}</td><!-- TREND -->
            <td class="right ${toMovesClass(item)}">${item.computed[Fields.Computed.CountOfInDevMoves]}</td><!-- IN DEV TRANSITIONS COUNT -->
            <td class="right ${toDelaysClass(item)}" title="${item.iterations.join('\n')}">${item.iterations?.count || '-'}</td><!-- IN DEV TRANSITIONS COUNT -->
          </tr>
        `)).join('\n');
        const csvRows = context.items.map((item, i) => ([
                `${i + 1}`,
                `${item.id}`,
                `${item.fields['System.WorkItemType']}`,
                `${item.fields['System.Title']}`,
                `${item.fields[Fields.State]}`,
                `${item.fields[Fields.Effort] || 0}`,
                `${toExpectedText(item)}`,
                `${msToDaysTrunc(item.inDevMs)}`,
                `${toTrendText(item)}`,
                `${item.computed[Fields.Computed.CountOfInDevMoves]}`,
                `${item.iterations?.count || 0}`,
            ].join(csvSep)
        )).join(csvEOL);

        // const t = context.items.find(i => i.id === 3143857)
        // console.log(t);

        let title = `${context.iterationName ? context.iterationName : 'Current sprint'} - Work items`;
        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_TITLE -->', `${title}`);
        if (context.projectCode) reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_PROJECT_CODE -->', context.projectCode);
        if (context.projectTitle) reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_PROJECT_NAME -->', context.projectTitle);
        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_DATE -->', `Date: ${today}`);

        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_HEADERS -->', headers);
        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_ROWS -->', rows);

        if (reportHtmlContent.includes('<!-- TODO_')) throw new Error('Some TODOs are not replaced in the HTML template.');

        // const reportPath = `./executions/${filenameWithTimestampAnd(this._htmlReportName)}`;
        const reportPath = this._htmlReportPath;
        fs.writeFileSync(reportPath, reportHtmlContent);

        // const csvReportPath = `./executions/${filenameWithTimestampAnd(this._htmlReportName + '.csv')}`;
        const csvReportPath = this._htmlReportPath + '.csv';
        fs.writeFileSync(csvReportPath, csvHeader + csvRows);

        return context;
    }

}

module.exports.ExportToHTMLContextStep = ExportToHTMLContextStep;
