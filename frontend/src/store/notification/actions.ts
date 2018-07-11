import * as t from './types';
import { ActionCreator } from 'redux';

// Isn't this a bit verbose? (Talking to myself)
export const triggerNotification: ActionCreator<t.TriggerNotificationAction> 
= (message: string, position: t.NotificationPosition) => ({
    type: t.TRIGGER_NOTIFICATION,
    message: message,
    position: position
});

export const closeNotification: ActionCreator<t.CloseNotificationAction>
= () => ({
    type: t.CLOSE_NOTIFICATION
});