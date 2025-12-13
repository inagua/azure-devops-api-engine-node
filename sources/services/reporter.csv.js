const {Reporter} = require("./reporter");

class ReporterCSV extends Reporter {

    cellSeparator = ',';

    textFromHeaders() {
        return this._headers.join(this.cellSeparator) + '\n';
    }

    textFromCells() {
        return this._cells.join(this.cellSeparator);
    }

    getContent() {
        return this.textFromHeaders() + this.textFromRows();
    }

}

module.exports.ReporterCSV = ReporterCSV;
