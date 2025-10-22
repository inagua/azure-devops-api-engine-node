const fs = require('node:fs');

const {Step} = require('../engine/engine');
const {Fields} = require("./constants");
const { log } = require('node:console');


const filenameWithTimestampAnd = (filename) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace colons and dots with hyphens
    return `${timestamp}-${filename}`;
}

const msPerDay = 1000 * 60 * 60 * 24;
const msToDays = (ms) => Math.trunc(ms / msPerDay)

/**
 * Generate an HTML report.
 */
class ExportToHTMLStep extends Step {

    constructor({htmlTemplatePath, htmlReportName} = {}) {
        super()
            .prerequisites(['projectName'])
            .postrequisites([])
        ;
        this._htmlTemplatePath = htmlTemplatePath || './sources/resources/report.html';
        this._htmlReportName = htmlReportName || 'report.html';
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
          <th class="right">Estimation (Pts)</th>
          <th class="right">In Dev (Days)</th>
          <th class="right">In Dev (Transitions)</th>
          <th class="right">Trend (%)</th>
        `;

        const rows = context.items.map((item, i) => (`
          <tr>
            <td class="center">${i + 1}</td>
            <td class="center">${item.id}</td>
            <td>${item.fields['System.WorkItemType']}</td>
            <td><a href="https://dev.azure.com/${context.organization}/${context.projectName}/_workitems/edit/${item.id}" target="_blank">${item.fields['System.Title']}</a></td>
            <td><code>${item.fields['System.State']}</code></td>
            <td class="right">${item.fields[Fields.Effort] || '0'}</td><!-- EFFORT --> 
            <td class="right">${msToDays(item.inDevMs)}</td><!-- IN DEV DURATION -->
            <td class="right">${(item.inDevStateUpdates || []).length}</td><!-- IN DEV TRANSITIONS COUNT -->
            <td class="right trend-negative">-5%</td>
          </tr>
        `)).join('\n');

        // const t = context.items.find(i => i.id === 3143857)
        // console.log(t);

        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_TITLE -->', `${'List Of The Work Items'}`);
        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_PROJECT_CODE -->', `${'SPL'}`);
        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_PROJECT_NAME -->', `${'Storage & Plugging'}`);
        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_DATE -->', `Date: ${today}`);

        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_HEADERS -->', headers);
        reportHtmlContent = reportHtmlContent.replaceAll('<!-- TODO_ROWS -->', rows);

        if (reportHtmlContent.includes('<!-- TODO_')) throw new Error('Some TODOs are not replaced in the HTML template.');

        const reportPath = `./executions/${filenameWithTimestampAnd(this._htmlReportName)}`;
        fs.writeFileSync(reportPath, reportHtmlContent);

        return context;
    }

}

module.exports.ExportToHTMLStep = ExportToHTMLStep;
