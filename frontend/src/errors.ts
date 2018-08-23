import * as state from './state';
import { EJSVERSION } from 'elementary-js/dist/version';
import { OCELOTVERSION } from './version';

function getEmail() {
    const v = state.loggedIn.getValue();

    if (v.kind !== 'logged-out') {
        return v.email;
    }
    else {
        return '';
    }
}

function traceError(message: any, level: 'error' | 'log') {
    const version = `Ocelot ${OCELOTVERSION}, EJS ${EJSVERSION}`;
    const userAgent = window.navigator.userAgent;
    const err = { 
        username: getEmail(), 
        version, 
        userAgent, 
        message, 
        ejsVersion: EJSVERSION,
        ocelotVersion: OCELOTVERSION 
    };
    let body: string;
    try {
        body = JSON.stringify(err);
    }
    catch (exn) {
        // We could not turn message into JSON, see if it has a message ...
        if (message.message) {
            err.message = String(message.message);
        }
        else {
            err.message = String(message);
        }
        body = JSON.stringify(err);
    }

    fetch('https://us-central1-arjunguha-research-group.cloudfunctions.net/paws/error', {
        method: 'POST',
        body: body,
        headers: { 'Content-Type': 'application/json' }
    }).catch(reason => {
        console.error('Failed to log error ', reason);
    });
    if (level === 'error') {
        console.error(message);
    }
    else {
        console.log(message);
    }
}

window.addEventListener('error', (errorEvent) => {
    traceError({
        message: errorEvent.message,
        userProgram: state.currentProgram.getValue(),
        line: errorEvent.lineno,
        column: errorEvent.colno
    }, 'error');
});

const tracingConsole = {
    error: function(message: string) {
        traceError({ message: message }, 'error');
    },
    log: function(message: string) {
        traceError({ message: message }, 'log');
    }

}

export { tracingConsole as console };