import { Action } from 'redux';

export interface BatchActions extends Action {
    type: 'BATCH_ACTIONS';
    actions: Action[];
}

export type AllStates = any;