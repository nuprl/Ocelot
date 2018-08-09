import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { configureStore } from './store';
import Index from './mainPage';

import { USERNAME } from './store/userLogin/saga'
import { EJSVERSION } from 'elementary-js/dist/version';
import { OCELOTVERSION } from './version';

const store = configureStore();

ReactDOM.render(
    <Provider store={store}>
        <Index />
    </Provider>,
    document.querySelector('#root')
);


window.addEventListener('error', (x) => {
    const err = {
        username: USERNAME,
        ejsversion: EJSVERSION,
        ocelotversion: OCELOTVERSION,
        message: x.message,
        line: x.lineno,
        col: x.colno,
        error: String(x.error)
    };
    fetch('https://us-central1-arjunguha-research-group.cloudfunctions.net/paws/error', {
        method: 'POST',
        body: JSON.stringify(err),
        headers: { 'Content-Type': 'application/json' }
    }).catch(reason => {
        console.error('Failed to log error ', reason);
    });
    console.error(x.message);
});