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


// Exclude weekends (Saturday/Sunday) from duration calculations
const msInStateForUpdatesWithoutWE = (updates, expectedState = Fields.States.InDev) => {
    let inProgressStart = null;
    let totalBusinessMs = 0;

    // Helper: sum milliseconds between two dates excluding weekends
    const businessMsBetween = (start, end) => {
        if (!start || !end || end <= start) return 0;

        let ms = 0;

        // Work with copies to avoid mutating inputs
        let cur = new Date(start);
        const finish = new Date(end);

        // Iterate day-by-day, but chunk by midnight boundaries to handle partial days cleanly
        while (cur < finish) {
            // Next midnight from `cur`
            const nextMidnight = new Date(cur);
            nextMidnight.setHours(24, 0, 0, 0);

            // The end of the current chunk is either midnight or `finish`
            const chunkEnd = nextMidnight < finish ? nextMidnight : finish;

            const day = cur.getDay(); // 0 = Sun, 6 = Sat
            const isWeekend = (day === 0 || day === 6);

            if (!isWeekend) {
                ms += (chunkEnd - cur);
            }

            // Advance to the next chunk boundary
            cur = chunkEnd;
        }

        return ms;
    };

    for (const update of updates) {
        const stateChange = update.fields?.[Fields.State];
        if (!stateChange) continue;

        // Prefer ChangedDate.newValue if present, otherwise use revisedDate
        const changedDateRaw = update.fields?.[Fields.ChangedDate]?.newValue || update.revisedDate;
        const changedDate = new Date(changedDateRaw);

        // Entering the expected state: start interval if not already tracking
        if (stateChange?.newValue === expectedState && !inProgressStart) {
            inProgressStart = changedDate;
        }
        // Leaving the expected state: close interval if tracking
        else if (stateChange?.newValue !== expectedState && inProgressStart) {
            totalBusinessMs += businessMsBetween(inProgressStart, changedDate);
            inProgressStart = null;
        }
    }

    // If still in the expected state at the end, close with "now"
    if (inProgressStart) {
        totalBusinessMs += businessMsBetween(inProgressStart, new Date());
    }

    return totalBusinessMs;
};

/**
 * Duration in milliseconds passed in the given state for a work item, based on its Updates (weekends included).
 *
 * @param updates
 * @param expectedState
 * @returns {number}
 */
const msInStateForUpdates = (updates, expectedState = Fields.States.InDev) => {
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
    msInStateForUpdates,
    msInStateForUpdatesWithoutWE,
    iterationsForUpdates,
}
