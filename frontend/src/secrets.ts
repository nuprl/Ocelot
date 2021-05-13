const isProd = true;
// The URL to the Cloud Function on the backend
export const CLD_FN_BASE_URL = `https://us-central1-ocelot-ide-org.cloudfunctions.net/ocelot/`;
// From backend/env.yaml
export const LOGIN_CLIENT_ID = '842833214550-7apj11arna9fauh5tba8hl3bnej3dhqc.apps.googleusercontent.com';
export const MODULE_WL_URL = `https://raw.githubusercontent.com/umass-compsci220/ocelot-settings/master/libraries${isProd ? '' : '-beta'}.json`;