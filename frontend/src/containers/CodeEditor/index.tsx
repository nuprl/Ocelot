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
import { editFile } from 'store/userFiles/actions';
import { connect } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';
import { debounce } from 'lodash';

type Props = {
    enabled: boolean,
    code: string,
    fileIndex: number,
    fileName: string
    saveCode: (
        fileIndex: number,
        fileName: string,
        content: string
    ) => void
};

class CodeEditor extends React.PureComponent<Props> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    constructor(props: Props) {
        super(props);
        this.editor = undefined;
    }

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        // tslint:disable-next-line:no-console
        console.log('editorDidMount', editor);
        editor.focus();
        this.editor = editor;
        const onCtrlSave = () => {
            const { fileIndex, fileName, code } = this.props;
            this.props.saveCode(fileIndex, fileName, code);
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

    saveCodeChanges = (code: string) => {
        const { fileIndex, fileName } = this.props;
        this.props.saveCode(fileIndex, fileName, code);
        // tslint:disable-next-line:no-console
        // console.log(code);
    };

    onChange = (code: string) => {
        debounce(() => this.saveCodeChanges(code), 500)();
        // debounce - user will type a lot, this will only
        // call saveCodeChanges only once 500ms after a bunch
        // of code changes fire
    }
    

    // React docs do not recommend me to prevent renderings
    // with this but I have to do it because I'm using debounce
    // Would be great if someone can figure out a better way
    // than this. (Hopefully no bugs will arise from this method)
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
        fileIndex: number,
        fileName: string,
        content: string
    ) => {
        dispatch(editFile(fileIndex, fileName, content));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeEditor);