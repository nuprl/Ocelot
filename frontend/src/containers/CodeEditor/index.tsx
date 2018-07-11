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
import { editFileRequest } from 'store/userFiles/actions';

type Props = {
    enabled: boolean,
    code: string,
    fileIndex: number,
    fileName: string
    saveCode: (
        fileName: string,
        content: string
    ) => void
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
        // tslint:disable-next-line:no-console
        console.log('editorDidMount', editor);
        editor.focus();
        this.editor = editor;
        const onCtrlSave = () => {
            const { fileName, code } = this.props;
            this.props.saveCode(fileName, code);
        };
        editor.addCommand(
            // tslint:disable-next-line:no-bitwise
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
            onCtrlSave,
            '');
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

    saveCodeChanges = () => {
        const { fileName } = this.props;
        this.props.saveCode(fileName, this.code);
        // tslint:disable-next-line:no-console
        console.log('Saved! ', {code: this.code});
    };
    
    // This debounceSave debounces the repeated firing of 
    // code changes but the run button does not have the
    // updated code until this debounce function runs
    // the save function. There must be a way or the run
    // button to have access to the immediate code.
    debounceSave = debounce(this.saveCodeChanges, 700);

    onChange = (code: string) => {
        this.code = code;

        this.debounceSave();
    }

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
            language: 'javascript',
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    saveCode: (
        fileName: string,
        content: string
    ) => {
        dispatch(editFileRequest(fileName, content));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeEditor);