import { ActionCreator } from 'redux';
import { ADD_NEW_LOG, AddNewLogAction, Log } from './types';

export const addNewLog: ActionCreator<AddNewLogAction>
    = (log: Log) => ({
        type: ADD_NEW_LOG,
        log: log
    });