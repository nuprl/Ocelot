import { Reducer } from 'redux';
import * as t from './types';

const helloWorldCode = `/**
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
    let newFiles: t.UserFile[],
        newFileSaved: boolean[],
        newState: t.UserFilesState;
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
                    fileSaved: new Array(action.userFiles.length).fill(true),
                    selectedFileIndex: -1
                },
                folderInfo: {
                    open: true,
                    filesLoading: false,
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
                filesInfo: {
                    ...state.filesInfo,
                    newFile: true,
                },
                folderInfo: {
                    ...state.folderInfo,
                    open: true,
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
                    selectedFileIndex: state.filesInfo.files.length,
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
            const isFileIndex
                = (elem: boolean | t.UserFile, index: number) => index !== action.fileIndex;
            newFiles = state.filesInfo.files.filter(isFileIndex);
            newFileSaved = state.filesInfo.fileSaved.filter(isFileIndex);
            newState = {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    files: newFiles,
                    fileSaved: newFileSaved
                }
            };
            if (action.fileIndex === state.filesInfo.selectedFileIndex) {
                newState.filesInfo.selectedFileIndex = -1;
            }
            return newState;
        case t.TRIGGER_NEW_FILE_ERROR:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    newFileError: true
                }
            };
        case t.EDIT_FILE_LOCAL:
            newFiles = [...state.filesInfo.files];
            newFiles[action.fileIndex] = {
                ...state.filesInfo.files[action.fileIndex],
                content: action.content
            };
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    files: newFiles
                }
            };
        case t.EDIT_FILE_CLOUD:
            newFileSaved = [...state.filesInfo.fileSaved];
            newFileSaved[action.fileIndex] = false;
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    fileSaved: newFileSaved
                }
            };
        // Temporary solution, will plan to expand this.
        // How do we plan to handle when there's no internet?
        // case t.EDIT_FILE_FAILURE:
        //     return {
        //         ...state,
        //         filesInfo: {
        //             ...state.filesInfo,
        //             fileSaved: new Array(state.filesInfo.files.length).fill(true),
        //             selectedFileIndex: -1
        //         }
        //     };
        case t.MARK_FILE_NOT_SAVED:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    fileSaved: state.filesInfo.fileSaved.map(
                        (elem, index) => {
                            if (index === action.fileIndex) {
                                return false;
                            }
                            return elem;
                        }
                    ),
                }
            };
        case t.MARK_FILE_SAVED:
            return {
                ...state,
                filesInfo: {
                    ...state.filesInfo,
                    fileSaved: state.filesInfo.fileSaved.map(
                        (elem, index) => {
                            if (index === action.fileIndex) {
                                return true;
                            }
                            return elem;
                        }
                    ),
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