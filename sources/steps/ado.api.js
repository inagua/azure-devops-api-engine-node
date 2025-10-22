const axios = require('axios');

const {ADO} = require("../../credentials");


const http = axios.create({
    baseURL: ADO.Site
});

const pathForOrg = (org, topic = '') => `/${org}${topic}`;
const pathForOrgAndProject = (org, project, topic = '') => pathForOrg(org, `/${project}${topic}`);

const get$ = (org, project, path) => {
    const url = pathForOrgAndProject(org, project, path);
    return http.get(url, {
        auth: {
            username: ADO.Email,
            password: ADO.PersonalAccessToken,
        },
        headers: {
            'Content-Type': 'application/json; charset=utf-8;'
        }
    });
}

const post$ = (org, project, path, data) => {
    const url = project ? pathForOrgAndProject(org, project, path) : pathForOrg(org, path);
    return http.post(url,
        data, 
        {
            auth: {
                username: ADO.Email,
                password: ADO.PersonalAccessToken,
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}

module.exports.get$ = get$;
module.exports.post$ = post$;
