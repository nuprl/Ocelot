import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { rootReducer, rootSaga } from './store';
import { enableBatching } from './store/batchActions';
import Index from './pages/index';

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    enableBatching(rootReducer),
    applyMiddleware(sagaMiddleware)
);

sagaMiddleware.run(rootSaga);

ReactDOM.render(
    <Provider store={store}>
        <Index />
    </Provider>,
    document.querySelector('#root')
);
