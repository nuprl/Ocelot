import { Reducer } from 'redux';
import * as t from './types';

const helloWorldCode = `
/**
 * @param name to greet
 * @returns a greeting
 */
function greeting(name) {
    return \`Hello \${name}!\`
}

console.log(greeting('World'));
`;

const initialState: t.UserFilesState = {
    folderInfo: {
        open: true,
        filesLoading: false,
    },
    filesInfo: {
        files: [{
            name: 'helloWorld.js',
            content: helloWorldCode
        }],
        selectedFileIndex: 0,
        newFile: false,
        newFileError: false,
        fileSaved: [true]
    }
};

const userFiles: Reducer<t.UserFilesState> = (
    state: t.UserFilesState = initialState,
    action: t.UserFilesActions): t.UserFilesState => {
    switch (action.type) {
        case t.LOAD_FILES_REQUEST:
            return {
                ...state,
                folderInfo: {
                    filesLoading: true,
                    open: false,
                }
            };
        case t.LOAD_FILES_SUCCESS:
            return {
                filesInfo: {
                    ...state.filesInfo,
                    files: action.userFiles,
                    fileSaved: new Array(action.userFiles.length).fill(true)
                },
                folderInfo: {
                    filesLoading: false,
                    open: true,
                }
            };
        case t.LOAD_FILES_FAILURE:
            return {
                ...state,
                folderInfo: {
                    ...state.folderInfo,
                    filesLoading: false,
                }
            };
        case t.TOGGLE_FILES_FOLDER:
            return {
                ...state,
                folderInfo: {
                    ...state.folderInfo,
                    open: !state.folderInfo.open
                }
            };
        case t.OPEN_FILES_FOLDER:
            return {
                ...state,
                folderInfo: {
                    ...state.folderInfo,
                    open: true,
                }
            };
        case t.CLOSE_FILES_FOLDER:
            return {
                ...state,
                folderInfo: {
                    ...state.folderInfo,
                    open: false,
                }
            };
        case t.CREATE_NEW_FILE_FIELD:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    newFile: true,
                }
            };
        case t.DELETE_NEW_FILE_FIELD:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    newFile: false,
                }
            };
        case t.CREATE_NEW_FILE:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    files: [
                        ...state.filesInfo.files,
                        {
                            name: action.fileName,
                            content: ''
                        },
                    ],
                    newFileError: false,
                    fileSaved: [
                        ...state.filesInfo.fileSaved,
                        true,
                    ]
                }
            };
        case t.SELECT_FILE:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    selectedFileIndex: action.fileIndex
                }
            };
        case t.DELETE_FILE:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    files: state.filesInfo.files.filter(
                        (elem, index) => index !== action.fileIndex
                    ),
                }
            };
        case t.TRIGGER_NEW_FILE_ERROR:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    newFileError: true
                }
            };
        case t.EDIT_FILE:
            let fileSaved = [...state.filesInfo.fileSaved];
            if (state.filesInfo.fileSaved[action.fileIndex]) {
                fileSaved = state.filesInfo.fileSaved.map(
                    function (isSaved: boolean, index: number) {
                        if (index === action.fileIndex) {
                            return false;
                        }
                        return isSaved;
                    }
                );
            }
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    files: state.filesInfo.files.map(
                        function (elem: t.UserFile, index: number) {
                            if (index === action.fileIndex) {
                                return {
                                    ...elem,
                                    content: action.content
                                };
                            }
                            return elem;
                        }
                    ),
                    fileSaved: fileSaved
                }
            };

        case t.CLEAR_FILES:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    files: []
                }
            };
        case t.RESET_DEFAULT_FILES:
            return {
                ...initialState
            };
        default:
            return state;
    }
};

export default userFiles;