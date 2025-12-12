const {Fields} = require("../steps/constants");


const filterPrefixes = (arr) => {
    // Sort by length descending so longer strings come first
    const sorted = [...arr].sort((a, b) => b.length - a.length);

    const result = [];
    for (let i = 0; i < sorted.length; i++) {
        const candidate = sorted[i];
        // Check if candidate is a prefix of any string already kept
        const isPrefix = result.some(str => str.startsWith(candidate));
        if (!isPrefix) {
            result.push(candidate);
        }
    }

    // Return in original order if needed
    return result.reverse(); // reverse to restore original relative order
}

const iterationsForUpdates = (updates) => {
    const iterations = updates
        .filter(u => u?.fields && !!u.fields[Fields.IterationPath])
        .map(u => ([u.fields[Fields.IterationPath].newValue, u.fields[Fields.IterationPath].oldValue]))
        .reduce((u, acc) => acc.concat(u.filter(i => !!i)), []);
    return filterPrefixes(iterations);
};



module.exports.ItemsService = {
    iterationsForUpdates,
}
