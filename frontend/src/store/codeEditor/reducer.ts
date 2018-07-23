import { Reducer } from 'redux';
import * as t from './types';

const initialState: t.CodeEditorState = {
    codeRunner: undefined,
    testRunner: undefined,
};

const codeEditor: Reducer<t.CodeEditorState> = (
    state: t.CodeEditorState = initialState,
    action: t.CodeEditorActions): t.CodeEditorState => {
    switch (action.type) {
        case t.SET_CODE_RUNNER:
            return {
                ...state,
                codeRunner: action.runner
            };
        case t.REMOVE_CODE_RUNNER:
            return {
                ...state,
                codeRunner: undefined
            };
        case t.SET_TEST_RUNNER:
            return {
                ...state, 
                testRunner: action.runner
            };
        case t.REMOVE_TEST_RUNNER:
            return {
                ...state,
                testRunner: undefined,
            };
        default:
            return state;
    }
};

export default codeEditor;