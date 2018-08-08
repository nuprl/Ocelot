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


window.addEventListener('error', (x) => {
    const err = {
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