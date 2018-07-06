import { Action } from 'redux';

// Action types
export const ADD_NEW_LOG = 'ADD_NEW_LOG';
export const REMOVE_OLD_LOGS = 'REMOVE_OLD_LOGS';

export type Log = {
    data: any[],
    id: string,
    method: string,
};

export interface AddNewLogAction extends Action {
    type: 'ADD_NEW_LOG';
    log: Log;
}

export interface RemoveOldLogsAction extends Action {
    type: 'REMOVE_OLD_LOGS';
    amount: number;
}

export type ConsoleLogsActions =
    | AddNewLogAction
    | RemoveOldLogsAction;

// State type

export type ConsoleLogsState = {
    logs: Log[]
};