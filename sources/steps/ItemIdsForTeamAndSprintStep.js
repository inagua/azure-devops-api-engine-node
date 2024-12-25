const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Get the IDs of the work items included in a given sprint for a given team.
 *
 * https://learn.microsoft.com/en-us/rest/api/azure/devops/work/iterations/get-iteration-work-items?view=azure-devops-rest-7.1&tabs=HTTP
 */
class ItemIdsForTeamAndSprintStep extends Step {

    _org;
    _project;
    _team;
    _sprint;

    constructor(org, project, team, sprint) {
        super();
        this._org = org;
        this._project = project;
        this._team = team;
        this._sprint = sprint;
    }

    async doRun$() {
        const res = await get$(this._org, this._project, `/${this._team}/_apis/work/teamsettings/iterations/${this._sprint}/workitems?api-version=7.1`);
        return res.data.workItemRelations.filter(i => !i.rel).map(i => i.target.id);
    }

}
module.exports.ItemIdsForTeamAndSprintStep = ItemIdsForTeamAndSprintStep;
