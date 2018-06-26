import {TRIGGER_ERROR_NOTIFICATION, CLOSE_ERROR_NOTIFICATION} from './actionTypes';

/**
 * An ErrorNotifcationActionType must have the type and an optional message
 */
export type ErrorNotificationActionType = {
    type: string,
    message?: string
};

export const triggerErrorNotification = (message: string) => ({
    type: TRIGGER_ERROR_NOTIFICATION,
    message: message
});

export const closeErrorNotification = () => ({
    type: CLOSE_ERROR_NOTIFICATION
})