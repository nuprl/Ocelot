import { ErrorNotificationActionType } from  './actions';
import {TRIGGER_ERROR_NOTIFICATION, CLOSE_ERROR_NOTIFICATION} from './actionTypes';
import { ErrorNotificationState } from './constants';

const initialState = {open: false, message: ''};

/**
 * A reducer for handling triggering and closing Error notification
 *
 * @param {ErrorNotificationState} [state={open: false, message: ''}]
 * @param {ErrorNotificationActionType} action
 * @returns {ErrorNotificationState}
 */

export const errorNotification = (
    state: ErrorNotificationState = initialState,
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