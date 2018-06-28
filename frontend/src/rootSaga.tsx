import { all } from 'redux-saga/effects';
import { watchUserLoginRequest as UserLoginSaga } from './containers/UserLogin/saga';

export default function* rootSaga() {
    yield all([
        UserLoginSaga(),
    ]);
}