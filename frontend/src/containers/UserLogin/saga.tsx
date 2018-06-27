import { call, put, takeEvery } from 'redux-saga/effects';
import { UserLoginAction } from './constants'
import Api from './api';

function* validateUser(action: UserLoginAction) {
    try {
        const response = yield call(Api.validateUser, action.googleUser)
    }
}