import { combineReducers, Reducer } from 'redux';
// -- States --
import { ErrorNotificationState } from './errorNotification/types';
import { UserLoginState } from './userLogin/types';
import { UserFilesState } from './userFiles/types';
// -- Reducers --
import errorNotificationReducer from './errorNotification/reducer';
import userLoginReducer from './userLogin/reducer';
import userFilesReducer from './userFiles/reducer';
// -- Redux Store --
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { enableBatching } from './batchActions';
// -- Saga stuff -- 
import { all } from 'redux-saga/effects';
import { watchUserLoginRequest } from './userLogin/saga';
import { watchLoadUserFilesRequest } from './userFiles/saga';

export interface RootState {
    errorNotification: ErrorNotificationState;
    userLogin: UserLoginState;
    userFiles: UserFilesState;
}

const rootReducer: Reducer<RootState> = combineReducers<RootState>({
    errorNotification: errorNotificationReducer,
    userLogin: userLoginReducer,
    userFiles: userFilesReducer
});

function* rootSaga() {
    yield all([
        watchUserLoginRequest(),
        watchLoadUserFilesRequest(),
    ]);
}

export const configureStore = () => {

    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        enableBatching(rootReducer),
        applyMiddleware(sagaMiddleware)
    );

    sagaMiddleware.run(rootSaga);
    return store;
};