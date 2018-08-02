import { Reducer } from 'redux';
import * as t from './types';

const initialState: t.CodeEditorState = {
    codeRunner: undefined,
    testRunner: undefined,
    monacoEditor: undefined,
};

const codeEditor: Reducer<t.CodeEditorState> = (
    state: t.CodeEditorState = initialState,
    action: t.CodeEditorActions): t.CodeEditorState => {
    switch (action.type) {
        case t.SET_MONACO_EDITOR:
            return {
                ...state,
                monacoEditor: action.monacoEditor
            }
        default:
            return state;
    }
};


export default codeEditor;