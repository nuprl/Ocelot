import * as t from './types';
import { ActionCreator } from 'redux';
import * as monacoEditor from 'monaco-editor';

export const setCodeRunner: ActionCreator<t.SetCodeRunnerAction>
    = (runner: any) => ({
        type: t.SET_CODE_RUNNER,
        runner: runner,
    });

export const removeCodeRunner: ActionCreator<t.RemoveCodeRunnerAction>
    = () => ({
        type: t.REMOVE_CODE_RUNNER
    });

export const setTestRunner: ActionCreator<t.SetTestRunnerAction>
= (runner: any) => ({
    type: t.SET_TEST_RUNNER,
    runner: runner,
});

export const removeTestRunner: ActionCreator<t.RemoveTestRunnerAction>
= () => ({
    type: t.REMOVE_TEST_RUNNER
});

export const setMonacoEditor: ActionCreator<t.SetMonacoEditorAction>
= (monacoEditor: monacoEditor.editor.IStandaloneCodeEditor) => ({
    type: t.SET_MONACO_EDITOR,
    monacoEditor: monacoEditor
});