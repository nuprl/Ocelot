import { combineReducers, Reducer } from 'redux';
// -- States --
import { NotificationState } from './notification/types';
import { UserFilesState } from './userFiles/types';
// -- Reducers --
import notificationReducer from './notification/reducer';
import userFilesReducer from './userFiles/reducer';
// -- Redux Store --
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { enableBatching } from './batchActions';
// -- Saga stuff -- 
import { all } from 'redux-saga/effects';
import {
    watchLoadUserFilesRequest,
    watchCreateNewFile,
    watchDeleteFile,
    watchEditFile
} from './userFiles/saga';
// -- logger --
// import { createLogger } from 'redux-logger';

// root state
export interface RootState {
    notification: NotificationState;
    userFiles: UserFilesState;
}

// combine all reducers
const rootReducer: Reducer<RootState> = combineReducers<RootState>({
    notification: notificationReducer,
    userFiles: userFilesReducer
});

function* rootSaga() { // Combine all sagas 
    yield all([
        watchLoadUserFilesRequest(),
        watchCreateNewFile(),
        watchDeleteFile(),
        watchEditFile(),
    ]);
}

export const configureStore = () => {

    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        enableBatching(rootReducer),
        applyMiddleware(sagaMiddleware, )
    );

    sagaMiddleware.run(rootSaga);
    return store;
};