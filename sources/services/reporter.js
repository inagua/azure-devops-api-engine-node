class Reporter {

    _filePath;
    _headers = [];
    _cells = [];
    _rows = [];

    filePath() {
        this._filePath = filePath;
        return this;
    }

    header(h) {
        this._headers.push(h);
        return this;
    }

    headers(hs) {
        this._headers = hs;
        return this;
    }

    cell(c) {
        this._cells.push(c);
        return this;
    }

    row(r) {
        let _r = r;
        if (!_r) {
            if (this._headers.length > 0 && this._cells.length !== this._headers.length)
                throw new Error(`Length difference between Headers (${this._headers.length}) and Cells (${this._cells.length})!`);
            _r = this.textFromCells();
            this._cells = [];
        }
        this._rows.push(_r);
        return this;
    }

    textFromCells() {
        throw new Error('Must be overriden!');
    }

    textFromRows() {
        return this._rows.join('\n');
    }

    save(content) {
        // const reportPath = `./executions/${filenameWithTimestampAnd(this._htmlReportName)}`;
        // const reportPath = this._htmlReportPath;
        if (!this._filePath) throw new Error('No path for the report!');
        fs.writeFileSync(this._filePath, content);
    }

    getContent() {
        throw new Error('Must be overriden!');
    }

    generate() {
        this.save(this.getContent());

        return this;
    }

}

module.exports.Reporter = Reporter;
