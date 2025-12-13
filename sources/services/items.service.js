const {Fields} = require("../steps/constants");


// https://momentjs.com/docs/#/durations/days/
const stateMSForRevisions = (revisions, expectedState = Fields.States.InDev) => {
    let inProgressStart = null;
    let totalDuration = 0;

    for (const rev of revisions) {
        const state = rev.fields[Fields.State];
        const changedDate = moment(rev.fields[Fields.ChangedDate]);

        if (state === expectedState && !inProgressStart) {
            inProgressStart = changedDate;
        } else if (state !== expectedState && inProgressStart) {
            totalDuration += moment.duration(changedDate.diff(inProgressStart)).asMilliseconds();
            inProgressStart = null;
        }
    }

    // If still in progress at the end
    if (inProgressStart) {
        totalDuration += moment.duration(moment().diff(inProgressStart)).asMilliseconds();
    }

    return totalDuration; //.toFixed(2);
}

const stateMSForUpdates = (updates, expectedState = Fields.States.InDev) => {
    let inProgressStart = null;
    let totalMs = 0;

    for (const update of updates) {
        const stateChange = update.fields?.[Fields.State];

        if (stateChange) {
            const changedDate = new Date(update.fields?.[Fields.ChangedDate]?.newValue || update.revisedDate);

            if (stateChange?.newValue === expectedState && !inProgressStart) {
                inProgressStart = changedDate;
            } else if (stateChange?.newValue !== expectedState && inProgressStart) {
                totalMs += changedDate - inProgressStart;
                inProgressStart = null;
            }
        }
    }

    // If still in progress at the end
    if (inProgressStart) {
        totalMs += new Date() - inProgressStart;
    }

    // const days = totalMs / (1000 * 60 * 60 * 24);
    // return days.toFixed(2);
    return totalMs; //.toFixed(2);
}

const filterPrefixes = (arr) => {
    // Sort by length descending so longer strings come first
    const sorted = [...arr].sort((a, b) => b.length - a.length);

    const result = [];
    for (let i = 0; i < sorted.length; i++) {
        const candidate = sorted[i];
        // Check if candidate is a prefix of any string already kept
        const isPrefix = result.some(str => str.startsWith(candidate));
        if (candidate && !isPrefix) {
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

const countOfInDevMoves = (item) => (item.inDevStateUpdates || []).length;
const isDevCompleted = (item) => {
    const isStarted = countOfInDevMoves(item) > 0;
    return (item.fields[Fields.State] !== Fields.States.InDev) && isStarted;
}


module.exports.ItemsService = {
    countOfInDevMoves,
    isDevCompleted,

    stateMSForRevisions,
    stateMSForUpdates,
    iterationsForUpdates,
}
