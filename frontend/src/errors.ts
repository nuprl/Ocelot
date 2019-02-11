import * as state from './state';
import { getCloudFunctionBaseUrl } from './secrets';
import { EJSVERSION } from '@stopify/elementary-js/dist/version';
import { OCELOTVERSION } from './version';

function getEmail() {
    const v = state.loggedIn.getValue();

    if (v.kind !== 'logged-out') {
        return v.email;
    } else {
        return '';
    }
}

function traceError(message: string) {
    if (window.location.hostname === 'localhost') {
      console.log('WARNING: Cloud error reporting disabled for localhost');
      console.error(`Caught the following error:`);
      console.error(message);
      return;
    }
    const version = `Ocelot ${OCELOTVERSION}, EJS ${EJSVERSION}`;
    const userAgent = window.navigator.userAgent;
    const err = {
        username: getEmail(),
        version,
        userAgent,
        message,
        userProgram: state.currentProgram.getValue(),
    };
    let body: string;
    try {
        body = JSON.stringify(err);
    } catch (exn) {
        err.message = String(err.message);
        body = JSON.stringify(err);
    }

    fetch(`${getCloudFunctionBaseUrl()}error`, {
        method: 'POST',
        body: body,
        headers: { 'Content-Type': 'application/json' }
    }).catch(reason => {
        console.error('Failed to log error ', reason);
    });
}

window.addEventListener('error', (errorEvent) => {
    console.error(errorEvent.message);
    traceError(
      `${errorEvent.message} at line ${errorEvent.lineno}, column ${errorEvent.colno}, file ${errorEvent.filename}`);
});

const tracingConsole = {
    error: function(message: string) {
        console.error(message);
        traceError(message);
    },
    log: function(message: string) {
        console.log(message);
        traceError(message);
    }

};

export { tracingConsole as console };
