const fs = require('node:fs');
const {Reporter} = require("./reporter");

class ReporterHTML extends Reporter {

    _replacers = [];

    templatePath(path) {
        this._templatePath = path;
        return this;
    }

    replace(placeholder, value) {
        this._replacers.push({placeholder, value});
        return this;
    }

    textFromHeaders() {
        return this._headers.join('\n') + '\n';
    }

    textFromCells() {
        return `<tr>\n` + this._cells.join('\n') + `\n</tr>\n`;
    }

    getContent() {
        this
            .replace('<!-- TODO_HEADERS -->', this.textFromHeaders())
            .replace('<!-- TODO_ROWS -->', this.textFromRows())
        ;

        let html = fs.readFileSync(this._templatePath, 'utf8');
        html = this._replacers.reduce((acc, r) => acc.replaceAll(r.placeholder, r.value), html);
        if (html.includes('<!-- TODO_')) throw new Error('Some TODOs are not replaced in the HTML template.');

        return html;
    }
}

module.exports.ReporterHTML = ReporterHTML;
