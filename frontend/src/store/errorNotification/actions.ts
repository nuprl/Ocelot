import {
    TRIGGER_ERROR_NOTIFICATION,
    CLOSE_ERROR_NOTIFICATION,
    TriggerErrorNotificationAction,
    CloseErrorNotificationAction
} from './types';
import { ActionCreator } from 'redux';

// Isn't this a bit verbose? (Talking to myself)
export const triggerErrorNotification: ActionCreator<TriggerErrorNotificationAction>
    = (message: string) => ({
        type: TRIGGER_ERROR_NOTIFICATION,
        message: message
    });

export const closeErrorNotification: ActionCreator<CloseErrorNotificationAction>
    = () => ({
        type: CLOSE_ERROR_NOTIFICATION
    });