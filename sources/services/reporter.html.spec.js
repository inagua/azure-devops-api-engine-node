/**
 * Created by jacques on 12.12.2025.
 */

// http://code.tutsplus.com/tutorials/http-mock-testing-in-nodejs--cms-22836
// const _ = require('lodash');
// const moment = require('moment');

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect; // we are using the "expect" style of Chai
const chalk = require("chalk");

const {ReporterHTML} = require("./reporter.html");


describe(chalk.underline('Reporter HTML'), function () {

    beforeEach(async () => {
    });

    afterEach(async function () {
    });

    describe('.header()', function () {
        it('should successfully integrate headers, one per one, to report', async function () {
            const htmlReporter = new ReporterHTML()
                .header('<th>#</th>')
                .header('<th>ID</th>')
                .header('<th>TITLE</th>')
            ;
            [{a: 1, b: 2}, {a: 10, b: 20}].forEach((item, i) => {
                htmlReporter
                    .cell(`<td>${i + 1}</td>`)
                    .cell(`<td>${item.a}</td>`)
                    .cell(`<td>${item.b}</td>`)
                    .row();
            })

            expect(`<th>#</th>
<th>ID</th>
<th>TITLE</th>
`).to.eql(htmlReporter.textFromHeaders());

            expect(`<tr>
<td>1</td>
<td>1</td>
<td>2</td>
</tr>

<tr>
<td>2</td>
<td>10</td>
<td>20</td>
</tr>
`).to.eql(htmlReporter.textFromRows());
        });
    });

});
