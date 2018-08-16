import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Index from './mainPage';

ReactDOM.render(
    <Index />,
    document.querySelector('#root')
);

window.addEventListener('load', () => {
    const updateOnlineStatus = (event: Event) => {
        let condition = navigator.onLine ? "online" : "offline";
        if (condition === 'online') {
            throw new Error('Reconnected back to internet');
        }
        // do some stuff when it goes offline, disable the whole editor..etc
    }
    
    setTimeout(() => {
        window.addEventListener('online',  updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }, 5000);
});