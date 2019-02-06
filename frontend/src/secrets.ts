
export function getCloudFunctionBaseUrl(): string {
    if (window.location.hostname === 'www.ocelot-ide.org') {
        return 'https://us-central1-arjunguha-research-group.cloudfunctions.net/paws/';
    }
    else {
        return 'https://us-central1-arjunguha-research-group.cloudfunctions.net/ocelot-beta/';
    }
}

export const LOGIN_CLIENT_ID : string = '692270598994-p92ku4bbjkvcddouh578eb1a07s8mghc.apps.googleusercontent.com';
export const MODULE_WL_URL : string = 'https://raw.githubusercontent.com/umass-compsci220/ocelot-settings/master/libraries.json';

