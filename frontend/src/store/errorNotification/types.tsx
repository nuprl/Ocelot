import { Action } from 'redux';

// ---------- ACTION TYPES ----------
export const TRIGGER_ERROR_NOTIFICATION = 'TRIGGER_ERROR_NOTIFICATION';
export const CLOSE_ERROR_NOTIFICATION = 'CLOSE_ERROR_NOTIFICATION';

export interface TriggerErrorNotificationAction extends Action {
    type: 'TRIGGER_ERROR_NOTIFICATION';
    message: string;
}

export interface CloseErrorNotificationAction extends Action {
    type: 'CLOSE_ERROR_NOTIFICATION';
}

export type ErrorNotificationActions =
    | TriggerErrorNotificationAction
    | CloseErrorNotificationAction;

// ---------- STATE TYPE ----------
export type ErrorNotificationState = {
    open: boolean,
    message: string,
};