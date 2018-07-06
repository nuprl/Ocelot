import { combineReducers, Reducer } from 'redux';
// -- States --
import { ErrorNotificationState } from './errorNotification/types';
import { UserLoginState } from './userLogin/types';
import { UserFilesState } from './userFiles/types';
import { ConsoleLogsState, ADD_NEW_LOG } from './consoleLogs/types';
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
import { createLogger } from 'redux-logger';

// root state
export interface RootState {
    errorNotification: ErrorNotificationState;
    userLogin: UserLoginState;
    userFiles: UserFilesState;
    consoleLogs: ConsoleLogsState;
}

// combine all reducers
const rootReducer: Reducer<RootState> = combineReducers<RootState>({
    errorNotification: errorNotificationReducer,
    userLogin: userLoginReducer,
    userFiles: userFilesReducer,
    consoleLogs: consoleLogsReducer,
});

function* rootSaga() { // Combine all sagas 
    yield all([
        watchUserLoginRequest(),
        watchLoadUserFilesRequest(),
        watchCreateNewFile(),
        watchDeleteFile(),
    ]);
}

const logger = createLogger({ // logger to log all actions
    predicate: (getState, action) => action.type !== ADD_NEW_LOG
    // will not log the actions done by the Console (else infinite loop)
});

export const configureStore = () => {

    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        enableBatching(rootReducer),
        applyMiddleware(sagaMiddleware, logger)
    );

    sagaMiddleware.run(rootSaga);
    return store;
};