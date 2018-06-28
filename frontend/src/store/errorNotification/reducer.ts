import { Reducer } from 'redux';
import { 
    ErrorNotificationState, 
    ErrorNotificationActions,
    TRIGGER_ERROR_NOTIFICATION,
    CLOSE_ERROR_NOTIFICATION
} from './types';

const initialState: ErrorNotificationState = { open: false, message: '' };

const errorNotification: Reducer<ErrorNotificationState> = (
    state: ErrorNotificationState = initialState,
    action: ErrorNotificationActions): ErrorNotificationState => {
    switch (action.type) {
        case TRIGGER_ERROR_NOTIFICATION:
            return {
                open: true,
                message: action.message,
            };
        case CLOSE_ERROR_NOTIFICATION:
            return {
                ...state,
                open: false,
            };
        default:
            return state;
    }
};

export default errorNotification;