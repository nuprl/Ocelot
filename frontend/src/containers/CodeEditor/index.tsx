import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import { RootState } from 'store';
import {
    getSelectedCode,
    isValidFileIndex,
    getSelectedFileName,
    getSelectedFileIndex
} from 'store/userFiles/selectors';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';
import { debounce } from 'lodash';
import { editFileRequest, markFileNotSaved } from 'store/userFiles/actions';

type Props = {
    enabled: boolean,
    code: string,
    fileIndex: number,
    fileName: string,
    loggedIn: boolean,
    saveCode: (
        fileName: string,
        content: string,
        loggedIn: boolean
    ) => void,
    triggerFileLoading: (fileIndex: number) => void,
};

class CodeEditor extends React.Component<Props> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    code: string;
    constructor(props: Props) {
        super(props);
        this.editor = undefined;
        this.code = props.code;
    }

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.focus();
        this.editor = editor;
    }

    handleResize = () => {
        if (typeof this.editor === 'undefined') {
            return;
        }
        this.editor.layout();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.editor === undefined) {
            return;
        }
        if (prevProps.enabled !== this.props.enabled) {
            this.editor.updateOptions({ readOnly: !this.props.enabled });
        }
    }

    // The user theoretically can only edit the file associated with the selected
    // file index so does it make sense to pass in file index when I can just get
    // the fileIndex from state?
    // Maybe good support for having multiple tabs for files later.
    triggerFileLoadingAnim = () => this.props.triggerFileLoading(this.props.fileIndex);

    debouncedTriggerFileLoading = debounce(this.triggerFileLoadingAnim, 700, {
        leading: true,
        trailing: false,
    });

    saveCodeChanges = () => {
        const { fileName } = this.props;
        this.props.saveCode(fileName, this.code, this.props.loggedIn);
        // tslint:disable-next-line:no-console
        console.log('Saved! ', { code: this.code });
    };

    // This debounceSave debounces the repeated firing of 
    // code changes but the run button does not have the
    // updated code until this debounce function runs
    // the save function. There must be a way or the run
    // button to have access to the immediate code.
    debounceSave = debounce(this.saveCodeChanges, 700);

    onChange = (() => {
        if (this.props.loggedIn) {
            return ((code: string) => {
                this.code = code;

                this.debouncedTriggerFileLoading();
                this.debounceSave();
            });
        }
        return ((code: string) => {
            this.code = code;

            this.debounceSave();
        });
    })();

    // React docs do not recommend me prevent renderings
    // with this but I have to do it because I'm using debounce
    // Hopefully, I'll figure out a better way.
    // (Hopefully no bugs will arise from this method)
    shouldComponentUpdate(nextProps: Props) {
        if (this.props.fileIndex !== nextProps.fileIndex) {
            return true;
        }
        return false;
    }

    render() {
        const { code } = this.props;

        const options: monacoEditor.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            mouseWheelZoom: true,
            fontSize: 18,
            scrollBeyondLastLine: false,
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    saveCode: (
        fileName: string,
        content: string,
        loggedIn: boolean
    ) => {
        dispatch(editFileRequest(fileName, content, loggedIn));
    },
    triggerFileLoading: (fileIndex: number) => {
        dispatch(markFileNotSaved(fileIndex));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeEditor);