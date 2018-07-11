import { Reducer } from 'redux';
import * as t from './types';

const initialState: t.NotificationState = {open: false, message: '', position: 'bottom-right'};

const errorNotification: Reducer<t.NotificationState> = (
    state: t.NotificationState = initialState,
    action: t.NotificationActions): t.NotificationState => {
    switch (action.type) {
        case t.TRIGGER_NOTIFICATION:
            return {
                open: true,
                message: action.message,
                position: action.position
            };
        case t.CLOSE_NOTIFICATION:
            return {
                ...state,
                open: false
            };
        default:
            return state;
    }
};

export default errorNotification;