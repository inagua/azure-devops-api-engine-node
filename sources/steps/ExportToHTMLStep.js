const path = require("path");const fs = require('node:fs');

const {Step} = require('../engine/engine');
const {Fields} = require("./constants");
const { log } = require('node:console');


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
class ExportToHTMLStep extends Step {

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
        `;
        const csvHeader = ['#', 'ID','TYPE', 'TITLE', 'STATE', 'ESTIMATION (SP)', 'EXPECTED (Days)', 'In Dev (Days)', 'GAP (%)', 'MOVES TO DEV'].join(csvSep) + csvEOL;

        const countOfInDevMoves = (item) => (item.inDevStateUpdates || []).length;
        const isDevCompleted = (item) => {
          const isStarted = countOfInDevMoves(item) > 0;
          return (item.fields[Fields.State] !== Fields.States.InDev) && isStarted;
        }

        // let totalEffort = 0;
        // let totalMs = 0;
        let coeffsSum = 0;
        let coeffsCount = 0;
        context.items.forEach(item => {
          const isStarted = countOfInDevMoves(item) > 0;
          const effort = item.fields[Fields.Effort];
          const inDevMs = item.inDevMs;
          if (isDevCompleted(item) && effort && inDevMs) {
            // totalEffort += effort;
            // totalMs += inDevMs;
            coeffsSum += inDevMs / effort;
            coeffsCount++;
            // console.log('>>>>>', inDevMs, effort, inDevMs / effort, coeffsSum);
          }
        });
        const coeffMs = coeffsCount ? coeffsSum / coeffsCount : 0;
        const coeffDays = msToDays(coeffMs);
        const expectedDaysForEffort = (effort) => effort * coeffDays;

        context.items.forEach((item, i) => {
          item._computed = {};
          item._computed[Fields.Computed.ExpectedDays] = expectedDaysForEffort(item.fields[Fields.Effort]);
          item._computed[Fields.Computed.DaysTrend] = item._computed[Fields.Computed.ExpectedDays] === 0 ? null : Math.trunc((msToDays(item.inDevMs) - expectedDaysForEffort(item.fields[Fields.Effort]))/expectedDaysForEffort(item.fields[Fields.Effort])*100);
          item._computed[Fields.Computed.CountOfInDevMoves] = countOfInDevMoves(item);
        });

        const toStateClass = (item) => {
          if (isDevCompleted(item)) return 'alert-green';
          return '';
        };
        const toExpectedText = (item) => {
          return Math.round(item._computed[Fields.Computed.ExpectedDays] || 0);
        };
        const toTrendClass = (item) => {
          if (item._computed[Fields.Computed.DaysTrend] != null && Math.abs(item._computed[Fields.Computed.DaysTrend]) < 10) return 'alert-green';
          if (item._computed[Fields.Computed.DaysTrend] > 20) return `alert-red`;
          if (item._computed[Fields.Computed.DaysTrend] < -20) return `alert-blue`;
          return '';
        };
        const toTrendText = (item) => {
          if (item._computed[Fields.Computed.DaysTrend] === 0) return '==';
          if (item._computed[Fields.Computed.DaysTrend] > 0) return `+${item._computed[Fields.Computed.DaysTrend]}%`;
          if (item._computed[Fields.Computed.DaysTrend]) return `${item._computed[Fields.Computed.DaysTrend]}%`;
          return '-';
        };
        const toMovesClass = (item) => {
          // if (item._computed[Fields.Computed.CountOfInDevMoves] === 1) return 'moves-ok';
          if (item._computed[Fields.Computed.CountOfInDevMoves] > 2) return `alert-red`;
          if (item._computed[Fields.Computed.CountOfInDevMoves] > 1) return 'alert-yellow';
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
            <td class="right ${toMovesClass(item)}">${item._computed[Fields.Computed.CountOfInDevMoves]}</td><!-- IN DEV TRANSITIONS COUNT -->
          </tr>
        `)).join('\n');
        const csvRows = context.items.map((item, i) => (`${i + 1}${csvSep}${item.id}${csvSep}${item.fields['System.WorkItemType']}${csvSep}`
          + `${item.fields['System.Title']}${csvSep}${item.fields[Fields.State]}${csvSep}${item.fields[Fields.Effort] || '0'}${csvSep}`
          + `${toExpectedText(item)}${csvSep}${msToDaysTrunc(item.inDevMs)}${csvSep}${toTrendText(item)}${csvSep}${item._computed[Fields.Computed.CountOfInDevMoves]}`))
          .join(csvEOL);

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

module.exports.ExportToHTMLStep = ExportToHTMLStep;
