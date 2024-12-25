const {ItemIdsForTeamAndSprintStep} = require("../sources/steps/ItemIdsForTeamAndSprintStep");
const {ItemsForItemIdsStep} = require("../sources/steps/ItemsForItemIdsStep");
const {StateUpdatesForItemStep} = require("../sources/steps/StateUpdatesForItemStep");
const {StateWentBackForItemStep} = require("../sources/steps/StateWentBackForItemStep");
const {FilterFieldValueStep} = require("../sources/steps/FilterFieldValueStep");
const {SummaryForItemStep} = require("../sources/steps/SummaryForItemStep");

const org = 'my-org';
const project = 'my-project';
const team = '83f521c7-0c78-4ed0-8455-xxx';
const sprint = 'f700cd65-bc95-46a0-b66f-xxx'; // Sprint 131


(async () => {
    const workflow =
        new ItemIdsForTeamAndSprintStep(org, project, team, sprint)
        .chain(new ItemsForItemIdsStep(org, project))
        .map(new StateUpdatesForItemStep(org, project))
        .map(new StateWentBackForItemStep())
        .filter(new FilterFieldValueStep('__stateWentBack', true))
        .map(new SummaryForItemStep())
    ;
    const r = await workflow.run$();
    console.log('>>>>>', require('util').inspect(r, {showHidden: false, depth: null}));
    // console.log(r);
})()

