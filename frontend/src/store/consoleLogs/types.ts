import { Action } from 'redux';

// Action types
export const ADD_NEW_LOG = 'ADD_NEW_LOG';

export type Log = {
    data: any[],
    id: string,
    method: string,
};

export interface AddNewLogAction extends Action {
    type: 'ADD_NEW_LOG';
    log: Log;
}

export type ConsoleLogsActions = AddNewLogAction;

// State type

export type ConsoleLogsState = {
    logs: Log[]
};