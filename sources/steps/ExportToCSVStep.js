const fs = require('node:fs');

const {Step} = require('../engine/engine');
const {Fields} = require("./constants");


const filenameWithTimestampAnd = (filename) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Replace colons and dots with hyphens
    return `${timestamp}-${filename}`;
}


/**
 * Write each item in a CSV file.
 */
class ExportToCSVStep extends Step {

    constructor(filename, {toStringCB, header} = {}) {
        super();
        this._filename = filename;
        this._toStringCB = toStringCB;

        this._filePath = `./executions/${filenameWithTimestampAnd(this._filename)}`;
        if (header) {
            fs.writeFileSync(this._filePath, header + `\n`, { flag: 'a+' });
        }
    }

    async doRun$(item) {
        const line = this._toStringCB ? this._toStringCB(item) : JSON.stringify(item);
        fs.writeFileSync(this._filePath, line + `\n`, { flag: 'a+' });

        return item;
    }

}

module.exports.ExportToCSVStep = ExportToCSVStep;
