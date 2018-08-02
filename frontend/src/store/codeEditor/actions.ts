import * as t from './types';
import { ActionCreator } from 'redux';
import * as monacoEditor from 'monaco-editor';

export const setMonacoEditor: ActionCreator<t.SetMonacoEditorAction>
= (monacoEditor: monacoEditor.editor.IStandaloneCodeEditor) => ({
    type: t.SET_MONACO_EDITOR,
    monacoEditor: monacoEditor
});