import { Action } from 'redux';

// Action types
export const CREATE_CODE_RUNNER = 'CREATE_CODE_RUNNER';
export const REMOVE_CODE_RUNNER = 'REMOVE_CODE_RUNNER';

export interface CreateCodeRunnerAction extends Action {
    type: 'CREATE_CODE_RUNNER';
    runner: any;
}

export interface RemoveCodeRunnerAction extends Action {
    type: 'REMOVE_CODE_RUNNER';
}

export type CodeEditorActions =
    | CreateCodeRunnerAction
    | RemoveCodeRunnerAction;

// State type
export type CodeEditorState = {
    runner: any
}; 