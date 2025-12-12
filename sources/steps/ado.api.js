const axios = require('axios');


// const http = axios.create({
//     baseURL: ADO.Site
// });
let http;

const pathForOrg = (org, topic = '') => `/${org}${topic}`;
const pathForOrgAndProject = (org, project, topic = '') => pathForOrg(org, `/${project}${topic}`);

const get$ = (org, project, path, credentials) => {
    if (!credentials) {
        const {ADO} = require("../../credentials");
        credentials = ADO;
    }
    if (!http) {
        http = axios.create({
            baseURL: credentials.Site
        });
    }
    const url = pathForOrgAndProject(org, project, path);
    return http.get(url, {
        auth: {
            username: credentials.Email,
            password: credentials.PersonalAccessToken,
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
