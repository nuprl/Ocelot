import { RootState } from 'store';

export const isValidFileIndex = (state: RootState) => {
    const index = state.userFiles.filesInfo.selectedFileIndex;
    return index >= 0 && index < state.userFiles.filesInfo.files.length;
};

export const getSelectedFileIndex
    = (state: RootState) => {
        if (!isValidFileIndex(state)) {
            return 0;
        }
        return state.userFiles.filesInfo.selectedFileIndex;
    };

export const getSelectedFile
    = (state: RootState) => {
        return state.userFiles.filesInfo.files[getSelectedFileIndex(state)];
    };

export const getSelectedFileName
= (state: RootState) => {
    return getSelectedFile(state).name;
};

export const getSelectedCode
    = (state: RootState) => {
        return getSelectedFile(state).content;
    };