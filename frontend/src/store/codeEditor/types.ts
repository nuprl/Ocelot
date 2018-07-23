import { Action } from 'redux';

// Action types
export const SET_CODE_RUNNER = 'SET_CODE_RUNNER';
export const REMOVE_CODE_RUNNER = 'REMOVE_CODE_RUNNER';
export const SET_TEST_RUNNER = 'SET_TEST_RUNNER';
export const REMOVE_TEST_RUNNER = 'REMOVE_TEST_RUNNER';

export interface SetCodeRunnerAction extends Action {
    type: 'SET_CODE_RUNNER';
    runner: any;
}

export interface RemoveCodeRunnerAction extends Action {
    type: 'REMOVE_CODE_RUNNER';
}

export interface SetTestRunnerAction extends Action {
    type: 'SET_TEST_RUNNER';
    runner: any;
}

export interface RemoveTestRunnerAction extends Action {
    type: 'REMOVE_TEST_RUNNER';
}

export type CodeEditorActions =
    | SetCodeRunnerAction
    | RemoveCodeRunnerAction
    | SetTestRunnerAction
    | RemoveTestRunnerAction;

// State type
export type CodeEditorState = {
    codeRunner: any
    testRunner: any
}; 