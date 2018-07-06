import { Reducer } from 'redux';
import * as t from './types';

const initialState: t.CodeEditorState = {
    runner: undefined,
};

const codeEditor: Reducer<t.CodeEditorState> = (
    state: t.CodeEditorState = initialState,
    action: t.CodeEditorActions): t.CodeEditorState => {
    switch (action.type) {
        case t.CREATE_CODE_RUNNER:
            return {
                ...state,
                runner: action.runner
            };
        case t.REMOVE_CODE_RUNNER:
            return {
                ...state,
                runner: undefined
            };
        default:
            return state;
    }
};

export default codeEditor;