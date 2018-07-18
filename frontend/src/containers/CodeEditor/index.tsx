import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import { RootState } from 'store';
import {
    getSelectedCode,
    isValidFileIndex,
    getSelectedFileName,
    getSelectedFileIndex,
    getSelectedIsSaved
} from 'store/userFiles/selectors';
import { editFileCloud, editFileLocal, markFileNotSaved } from 'store/userFiles/actions';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';
import { debounce } from 'lodash';

const debounceWait = 500; // milliseconds;

type Props = {
    enabled: boolean,
    code: string,
    fileIndex: number,
    fileName: string,
    loggedIn: boolean,
    isSaved: boolean,
    saveCode: (
        fileIndex: number,
        content: string,
    ) => void,
    saveCodeToCloud: (
        fileName: string,
        fileIndex: number,
        content: string,
        loggedIn: boolean,
    ) => void,
    triggerFileLoading: (fileIndex: number) => void,
};

type FileEdit = {
    fileName: string,
    fileIndex: number,
    code: string,
};

class CodeEditor extends React.Component<Props> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    fileEditsQueue: FileEdit[];
    constructor(props: Props) {
        super(props);
        this.editor = undefined;
        this.fileEditsQueue = [];
    }

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.setPosition({ lineNumber: 10, column: 0 });
        editor.focus();
        this.editor = editor;
    }

    componentDidUpdate(prevProps: Props) {
        if (!this.props.enabled && this.editor !== undefined) {
            this.editor.updateOptions({ readOnly: true });
        }
        if (prevProps.fileIndex === this.props.fileIndex) {
            return;
        }
        if (prevProps.isSaved) {
            return;
        }
        if (!prevProps.loggedIn) {
            return;
        }
        if (prevProps.fileIndex === -1) {
            return;
        }
        this.fileEditsQueue.push({
            fileName: prevProps.fileName,
            fileIndex: prevProps.fileIndex,
            code: prevProps.code,
        });
        if (this.editor === undefined) {
            return;
        }
        this.editor.focus();
    }

    handleResize = () => {
        if (typeof this.editor === 'undefined') {
            return;
        }
        this.editor.layout();
    }

    triggerFileLoadingAnim = () => this.props.triggerFileLoading(this.props.fileIndex);

    saveCodeCloudWrapper = () => {
        // tslint:disable-next-line:no-console
        let fileEdit: FileEdit;
        while (this.fileEditsQueue.length > 0) {
            fileEdit = this.fileEditsQueue.shift() as FileEdit;
            if (fileEdit.fileIndex === this.props.fileIndex) {
                continue;
            }
            this.props.saveCodeToCloud(
                fileEdit.fileName,
                fileEdit.fileIndex,
                fileEdit.code,
                this.props.loggedIn
            );
        }
        if (this.props.isSaved) {
            return;
        }
        this.props.saveCodeToCloud(
            this.props.fileName,
            this.props.fileIndex,
            this.props.code,
            this.props.loggedIn
        );

    };

    debouncedSaveCodeCloud = debounce(this.saveCodeCloudWrapper, debounceWait);

    onChange = (code: string) => {
        if (this.props.loggedIn) {
            // this.debouncedFileLoading();
            // this.triggerFileLoadingAnim();
            // this.debouncedSaveCodeCloud();
        }
        this.props.saveCode(this.props.fileIndex, code);

    };

    render() {
        const { code } = this.props;

        const options: monacoEditor.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            mouseWheelZoom: true,
            // fontSize: 18,
            // scrollBeyondLastLine: false,
        };

        return (
            <div style={{ height: '100%', width: '100%' }}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                <MonacoEditor
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    options={options}
                    onChange={this.onChange}
                    editorDidMount={this.editorDidMount}
                    height="calc(100% - 52px)"
                />
            </div >
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    enabled: isValidFileIndex(state),
    code: getSelectedCode(state),
    fileIndex: getSelectedFileIndex(state),
    fileName: getSelectedFileName(state),
    loggedIn: state.userLogin.loggedIn,
    isSaved: getSelectedIsSaved(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    saveCodeToCloud: (
        fileName: string,
        fileIndex: number,
        content: string,
        loggedIn: boolean
    ) => {
        dispatch(editFileCloud(fileName, fileIndex, content, loggedIn));
    },
    saveCode: (
        fileIndex: number,
        content: string,
    ) => {
        dispatch(editFileLocal(fileIndex, content));
    },
    triggerFileLoading: (fileIndex: number) => { dispatch(markFileNotSaved(fileIndex)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeEditor);