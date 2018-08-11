import { USERNAME } from './store/userLogin/saga'
import { EJSVERSION } from 'elementary-js/dist/version';
import { OCELOTVERSION } from './version';

function traceError(message: { [key: string]: any}) {
    const err = {
        username: USERNAME,
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

const updateOnlineStatus = (event: Event) => {
    let condition = navigator.onLine ? "online" : "offline";
    if (condition === 'online') {
        throw new Error('Reconnected back to internet');
    }
    // do some stuff when it goes offline, disable the whole editor..etc
}

window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

const tracingConsole = {
    error: function(message: string) {
        traceError({ message: message });
    }
}

export { tracingConsole as console };