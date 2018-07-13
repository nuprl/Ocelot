import { RootState } from 'store';

export const getSelectedFileIndex = (state: RootState) => (
    state.userFiles.filesInfo.selectedFileIndex
);

export const isValidFileIndex = (state: RootState) => {
    const index = getSelectedFileIndex(state);
    return index >= 0 && index < state.userFiles.filesInfo.files.length;
};

export const getSelectedFile
    = (state: RootState) => {
        if (isValidFileIndex(state)) {
            return state.userFiles.filesInfo.files[state.userFiles.filesInfo.selectedFileIndex];
        }
        return {
            name: '',
            content: '',
        };
    };

export const getSelectedFileName
= (state: RootState) => {
    return getSelectedFile(state).name;
};

export const getSelectedCode
    = (state: RootState) => {
        return getSelectedFile(state).content;
    };

export const getSelectedIsSaved = (state: RootState) => {
    if (!isValidFileIndex(state)) {
        return true;
    }
    return state.userFiles.filesInfo.fileSaved[getSelectedFileIndex(state)];
};