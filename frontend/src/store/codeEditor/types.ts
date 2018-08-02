import { Action } from 'redux';
import * as monacoEditor from 'monaco-editor';

// Action types
export const REMOVE_TEST_RUNNER = 'REMOVE_TEST_RUNNER';
export const SET_MONACO_EDITOR = 'SET_CODE_EDITOR';

export interface RemoveTestRunnerAction extends Action {
    type: 'REMOVE_TEST_RUNNER';
}

export interface SetMonacoEditorAction extends Action {
    type: 'SET_CODE_EDITOR';
    monacoEditor: monacoEditor.editor.IStandaloneCodeEditor
}

export type CodeEditorActions =
    | RemoveTestRunnerAction
    | SetMonacoEditorAction;

// State type
export type CodeEditorState = {
    codeRunner: any
    testRunner: any
    monacoEditor: monacoEditor.editor.IStandaloneCodeEditor | undefined
}; 