const isProd: boolean = window.location.hostname === 'www.ocelot-ide.org';
export const CLD_FN_BASE_URL: string = `https://us-central1-arjunguha-research-group.cloudfunctions.net/ocelot/`,
             LOGIN_CLIENT_ID: string = '692270598994-p92ku4bbjkvcddouh578eb1a07s8mghc.apps.googleusercontent.com',
             MODULE_WL_URL: string = `https://raw.githubusercontent.com/umass-compsci220/ocelot-settings/master/libraries${isProd ? '' : '-beta'}.json`;
