import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './rootReducer';
import Index from './pages/index';

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <Index />
    </Provider>,
    document.querySelector('#root')
);
