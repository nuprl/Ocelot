import {TRIGGER_ERROR_NOTIFICATION, CLOSE_ERROR_NOTIFICATION} from './actionTypes';

export const triggerErrorNotification = (message: string) => ({
    type: TRIGGER_ERROR_NOTIFICATION,
    message: message
});

export const closeErrorNotification = () => ({
    type: CLOSE_ERROR_NOTIFICATION
})