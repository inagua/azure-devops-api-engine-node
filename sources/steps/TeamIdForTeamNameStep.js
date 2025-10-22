const {Step} = require('../engine/engine');
const {get$} = require("./ado.api");


/**
 * Get the Team and its ID from its name, for a given project name.
 *
 * https://dev.azure.com/my-org/_apis/projects/my-project/teams?api-version=7.1
 */
class TeamForNameStep extends Step {

    constructor() {
        super()
            .prerequisites(['organization', 'projectName', 'teamName'])
            .postrequisites(['team', 'teamId'])
        ;
    }

    async doRun$(context) {
        const {data} = await get$(context.organization, '', `_apis/projects/${context.projectName}/teams?api-version=7.1`);
        const teams = data.value.filter(team => team.name === context.teamName);
        if (teams.length === 0) throw new Error(`No team found for name: ${context.teamName}`);
        if (teams.length > 1) throw new Error(`Several teams found for name: ${context.teamName}`);
        context.team = teams[0];
        context.teamId = context.team.id;
        return context;
    }

}

module.exports.TeamForNameStep = TeamForNameStep;
