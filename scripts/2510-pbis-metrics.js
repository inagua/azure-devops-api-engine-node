// Grant accesses to regular internal user (add to the organization, assign to group, check email as non external...)
// 
// USAGE:
//  - Duplicate this file and rename updating the date, and optionally the SNOW Incident ID.
//  - Update the snowIncident variable below (line 18): used in the report file name, can be empty ''.
//  - Update the emails variable below (line 19): comma separated array of strings.
//  - The groups to be assigned can be updated with the groupNames variable below (line 17): comma separated array of strings.
//  - From Dev Citrix machine, **from the root folder** call the script with: node .\scripts\251015-groups-assign.js
//  - The report will be created in the "executions" folder
//

// ########################################
// TO BE UPDATED: start
// ----------------------------------------

const organization = 'my-org';
const projectName = 'my-project';
const teamName = 'my-project Team'; // https://dev.azure.com/my-org/_apis/projects/my-project/teams?api-version=7.1
// const teamName = 'my-project BAU'; // https://dev.azure.com/my-org/_apis/projects/my-project/teams?api-version=7.1

// https://dev.azure.com/my-org/my-project/2a21d1dc-723c-4a86-a98b-b70fed271a4c/_apis/work/teamsettings/iterations?api-version=7.1
// const sprint = 'e4dbb609-3543-45cb-8d3b-697e76caf29e'; // Sprint 135 - 2025-05-05T00:00:00Z ... 2025-05-23T00:00:00Z
const iterationName = '' // Current
const backlogId = 'Microsoft.RequirementCategory'; // https://dev.azure.com/my-org/my-project/64ac4b0d-dc0f-4561-b61d-6fce811bf733/_apis/work/backlogs?api-version=7.1

// ----------------------------------------
// TO BE UPDATED: end
// ########################################


const {ItemIdsForTeamAndSprintStep} = require("../sources/steps/ItemIdsForTeamAndSprintStep");
const {ItemsForItemIdsStep} = require("../sources/steps/ItemsForItemIdsStep");
const {StateUpdatesForItemStep} = require("../sources/steps/StateUpdatesForItemStep");
const {StateWentBackForItemStep} = require("../sources/steps/StateWentBackForItemStep");
const {FilterFieldValueStep} = require("../sources/steps/FilterFieldValueStep");
const {FilterLambdaStep} = require("../sources/steps/FilterLambdaStep");
const {SummaryForItemStep} = require("../sources/steps/SummaryForItemStep");
const { IterationPathUpdatesForItemStep } = require("../sources/steps/IterationPathUpdatesForItemStep");
const { ExportToCSVStep } = require("../sources/steps/ExportToCSVStep");
const { TeamForNameStep } = require("../sources/steps/TeamIdForTeamNameStep");
const { LogContextStep } = require("../sources/steps/LogContextStep");
const { IterationForNameAndTeamIdStep } = require("../sources/steps/IterationForNameAndTeamIdStep");
const { ItemIdsForTeamAndBacklogStep } = require("../sources/steps/ItemIdsForTeamAndBacklogStep");
const { ItemsForItemIdsContextStep } = require("../sources/steps/ItemsForItemIdsContextStep");
const { ExportToHTMLStep } = require("../sources/steps/ExportToHTMLStep");
const { ItemIdsForTeamAndSprintContextStep } = require("../sources/steps/ItemIdsForTeamAndSprintComtextStep");
const { UpdatesForItemIdsContextStep } = require("../sources/steps/UpdatesForItemIds.Context.Step");
const {RevisionsForItemIdsContextStep} = require("../sources/steps/RevisionsForItemIds.Context.Step");




const lineForItem = (item) => {
    // {"id":2777610,"title":"Free days not retrieved from TMS","state":"04_Ready for test","changedDate":"2025-05-08T11:23:37.78Z","iterations":["my-project\\Sprint 134","my-project\\Sprint 135"],"links":{"api":"https://dev.azure.com/my-org/c91a1eb8-2aea-487f-80f1-789b4b6393b7/_apis/wit/workItems/2777610"}}
    const s = ';';
    const iterations = item.iterations.sort();
    const _iterations = JSON.stringify(iterations);
    const slided = iterations?.length || 0;
    return `${item.id}${s}${item.title}${s}${item.type}${s}${item.state}${s}${item.links.api}${s}${slided}${s}${_iterations}`;
}


(async () => {
    const workflow =
        new TeamForNameStep()
        .chain(new IterationForNameAndTeamIdStep())

        // BACKLOG ITEMS IDS
        // .chain(new ItemIdsForTeamAndBacklogStep())

        // SPRINT ITEMS IDS
        .chain(new ItemIdsForTeamAndSprintContextStep())

        .chain(new ItemsForItemIdsContextStep())
        .chain(new UpdatesForItemIdsContextStep())
        
        // .map(new IterationPathUpdatesForItemStep(org, project))
        // .map(new StateWentBackForItemStep())
        // .filter(new FilterFieldValueStep('__itemSlided', true))
        // .filter(new FilterLambdaStep((item) => item.__itemSlided))
        // .map(new SummaryForItemStep())
        // .map(new ExportToCSVStep('sliding-pbi.csv', {toStringCB: lineForItem, header: ['ID', 'TITLE', 'TYPE', 'STATE', 'API', 'SLIDED', 'SPRINTS'].join(';')}))
        .chain(new ExportToHTMLStep())
        // .chain(new LogContextStep())
    ;

    try {

        const r = await workflow.run$({
            organization, projectName, teamName, iterationName, backlogId
        });

    } catch (error) {
        const message = error.response?.data || error.message;
        // console.error('>>     - /!\\ ERROR for User', email, ':', message || error);
        console.error('>>     - /!\\ ERROR:', message || error);
        // fs.writeFileSync(reportFilename, email + `${ColumnSeparator}${ColumnSeparator}${ColumnSeparator}ERROR: ${JSON.stringify(message)}` + `\n`, { flag: 'a+' });
    }
    // console.log('>>>>>', require('util').inspect(r, {showHidden: false, depth: null}));
    // console.log(r);
})()

