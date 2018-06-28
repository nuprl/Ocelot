import { combineReducers } from 'redux';
import { errorNotification } from './containers/ErrorNotification/reducer';
import { userLogin } from './containers/UserLogin/reducer';

export default combineReducers({
    errorNotification,
    userLogin
});