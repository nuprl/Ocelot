import { ErrorNotificationActionType } from  './actions';
import {TRIGGER_ERROR_NOTIFICATION, CLOSE_ERROR_NOTIFICATION} from './actionTypes';
import { ErrorNotificationState } from './constants';

export const errorNotification = (
    state: ErrorNotificationState = {open: false, message: ''},
    action: ErrorNotificationActionType): ErrorNotificationState => {
    switch(action.type) {
        case TRIGGER_ERROR_NOTIFICATION:
            return {
                open: true,
                message: action.message!
            }
        case CLOSE_ERROR_NOTIFICATION:
            return {
                open: false,
                message: ''
            }
        default:
            return state;
    }
}