import * as state from './state';
import { EJSVERSION } from 'elementary-js/dist/version';
import { OCELOTVERSION } from './version';

function traceError(message: { [key: string]: any}) {
    const err = {
        username: state.email,
        ejsversion: EJSVERSION,
        ocelotversion: OCELOTVERSION,
        ...message
    };
    fetch('https://us-central1-arjunguha-research-group.cloudfunctions.net/paws/error', {
        method: 'POST',
        body: JSON.stringify(err),
        headers: { 'Content-Type': 'application/json' }
    }).catch(reason => {
        console.error('Failed to log error ', reason);
    });
    console.error(message);
}

window.addEventListener('error', (errorEvent) => {
    traceError({
        message: errorEvent.message,
        line: errorEvent.lineno,
        column: errorEvent.colno
    });
});

const tracingConsole = {
    error: function(message: string) {
        traceError({ message: message });
    }
}

export { tracingConsole as console };