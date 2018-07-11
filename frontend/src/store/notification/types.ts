import { Action } from 'redux';

// ---------- ACTION TYPES ----------
export const TRIGGER_NOTIFICATION = 'TRIGGER_NOTIFICATION';
export const CLOSE_NOTIFICATION = 'CLOSE_NOTIFICATION';

export type NotificationPosition = 'top' | 'bottom-right';

export interface TriggerNotificationAction extends Action {
    type: 'TRIGGER_NOTIFICATION';
    message: string;
    position: NotificationPosition;
}

export interface CloseNotificationAction extends Action {
    type: 'CLOSE_NOTIFICATION';
}

export type NotificationActions =
    | TriggerNotificationAction
    | CloseNotificationAction;

// ---------- STATE TYPE ----------
export type NotificationState = {
    open: boolean,
    position: NotificationPosition
    message: string,
};