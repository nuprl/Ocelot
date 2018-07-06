import { combineReducers, Reducer } from 'redux';
// -- States --
import { ErrorNotificationState } from './errorNotification/types';
import { UserLoginState } from './userLogin/types';
import { UserFilesState } from './userFiles/types';
import { ConsoleLogsState } from './consoleLogs/types';
// -- Reducers --
import errorNotificationReducer from './errorNotification/reducer';
import userLoginReducer from './userLogin/reducer';
import userFilesReducer from './userFiles/reducer';
import consoleLogsReducer from './consoleLogs/reducer';
// -- Redux Store --
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { enableBatching } from './batchActions';
// -- Saga stuff -- 
import { all } from 'redux-saga/effects';
import { watchUserLoginRequest } from './userLogin/saga';
import { watchLoadUserFilesRequest, watchCreateNewFile, watchDeleteFile } from './userFiles/saga';
// -- logger --
// import logger from 'redux-logger';

export interface RootState {
    errorNotification: ErrorNotificationState;
    userLogin: UserLoginState;
    userFiles: UserFilesState;
    consoleLogs: ConsoleLogsState;
}

const rootReducer: Reducer<RootState> = combineReducers<RootState>({
    errorNotification: errorNotificationReducer,
    userLogin: userLoginReducer,
    userFiles: userFilesReducer,
    consoleLogs: consoleLogsReducer,
});

function* rootSaga() {
    yield all([
        watchUserLoginRequest(),
        watchLoadUserFilesRequest(),
        watchCreateNewFile(),
        watchDeleteFile(),
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