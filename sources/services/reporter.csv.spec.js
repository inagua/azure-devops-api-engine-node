/**
 * Created by jacques on 12.12.2025.
 */

// http://code.tutsplus.com/tutorials/http-mock-testing-in-nodejs--cms-22836
// const _ = require('lodash');
// const moment = require('moment');

const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect; // we are using the "expect" style of Chai

const {ReporterCSV} = require("./reporter.csv");
const chalk = require("chalk");


describe(chalk.underline('Reporter CSV'), function () {

    beforeEach(async () => {
    });

    afterEach(async function () {
    });

    describe('.header()', function () {
        it('should successfully integrate headers, one per one, to report', async function () {
            const csvReporter = new ReporterCSV()
                .header('#')
                .header('ID')
                .header('TITLE')
            ;
            [{a: 1, b:2}, {a:10, b:20}].forEach((item, i) => {
                csvReporter
                    .cell(`${i + 1}`)
                    .cell(`${item.a}`)
                    .cell(`${item.b}`)
                    .row();
            })

            expect(`#,ID,TITLE\n1,1,2\n2,10,20`).to.eql(csvReporter.getContent());
        });
    });

    describe('.headers()', function () {
        it('should successfully integrate headers to report', async function () {
            const csvReporter = new ReporterCSV().headers(['#', 'ID', 'TITLE']);
            [{a: 1, b:2}, {a:10, b:20}].forEach((item, i) => {
                csvReporter
                    .cell(`${i + 1}`)
                    .cell(`${item.a}`)
                    .cell(`${item.b}`)
                    .row();
            })

            expect(`#,ID,TITLE\n1,1,2\n2,10,20`).to.eql(csvReporter.getContent());
        });
    });

    describe('.row()', function () {
        it('should raise an error when counts of headers and cols differs', async function () {
            const csvReporter = new ReporterCSV()
                .headers(['AAA', 'BBB'])
                .cell(`aaa`)
            ;

            expect(() => csvReporter.row())
                .to.throw('Length difference between Headers (2) and Cells (1)!');
        });
    });

});
