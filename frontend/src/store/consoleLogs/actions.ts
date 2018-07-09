import { ActionCreator } from 'redux';
import { ADD_NEW_LOG, AddNewLogAction, Log, RemoveOldLogsAction, REMOVE_OLD_LOGS } from './types';

export const addNewLog: ActionCreator<AddNewLogAction>
    = (log: Log) => ({
        type: ADD_NEW_LOG,
        log: log
    });

export const removeOldLogs: ActionCreator<RemoveOldLogsAction>
= (amount: number) => ({
    type: REMOVE_OLD_LOGS,
    amount: amount,
});