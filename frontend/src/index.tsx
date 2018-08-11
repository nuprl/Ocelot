import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { configureStore } from './store';
import Index from './mainPage';

const store = configureStore();

ReactDOM.render(
    <Provider store={store}>
        <Index />
    </Provider>,
    document.querySelector('#root')
);

const updateOnlineStatus = (event: Event) => {
    let condition = navigator.onLine ? "online" : "offline";
    if (condition === 'online') {
        throw new Error('Reconnected back to internet');
    }
    // do some stuff when it goes offline, disable the whole editor..etc
}

window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);