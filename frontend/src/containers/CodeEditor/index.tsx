import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import { RootState } from '../../store';
import {
    getSelectedCode,
    isValidFileIndex,
    getSelectedFileName,
    getSelectedFileIndex,
    getSelectedIsSaved
} from '../../store/userFiles/selectors';
import { editFileCloud, editFileLocal, markFileNotSaved } from '../../store/userFiles/actions';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';
import { debounce } from 'lodash';
import elemjshighlight from './elemjsHighlighter';
import { setMonacoEditor } from '../../store/codeEditor/actions';

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
    setEditor: (editor: monacoEditor.editor.IStandaloneCodeEditor) => void,
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

    editorWillMount = (monaco: typeof monacoEditor) => {
        // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        //     noLib: true,
        //     allowNonTsExtensions: true
        // });
        // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        //     noSemanticValidation: true,
        //     noSyntaxValidation: false,
        // });
        monaco.languages.register({ id: 'elementaryjs' });
        monaco.languages.setMonarchTokensProvider('elementaryjs', elemjshighlight());
        monaco.languages.setLanguageConfiguration('elementaryjs', {
            comments: {
                lineComment: '//',
                blockComment: ['/*', '*/']
            },
            indentationRules: {
                increaseIndentPattern: /.*(\{|\[|\()/, // indent on brackets...etc
                decreaseIndentPattern: /.*(\}|\]|\))/ //unindent on closing brackets...etc
            },
        });
        monaco.languages.registerCompletionItemProvider('elementaryjs', {
            // A hacky way to get rid of autocomplete suggestions completely.
            // returning an empty array will not 'override' the autocomplete
            // but giving my own autocomplete items can override it it seems.
            provideCompletionItems(model, position) {
                return [{
                    label: '',
                    kind: monaco.languages.CompletionItemKind.Text
                }];
            }
        });
    };

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.focus();
        editor.getModel().updateOptions({ tabSize: 2 }); // what if there are different models?
        if (window.location.hostname === 'localhost') {
            const code = window.localStorage.getItem('code');
            if (code !== null) {
                editor.setValue(code);
            }
        }
        this.props.setEditor(editor);
        this.editor = editor;
    }

    componentDidUpdate(prevProps: Props) {
        if (this.editor === undefined) {
            return;
        }
        this.editor.updateOptions({ readOnly: false });
        if (!this.props.enabled) {
            this.editor.updateOptions({ readOnly: true });
        }
        const endingCriteria = prevProps.fileIndex === this.props.fileIndex
            || prevProps.isSaved
            || !prevProps.loggedIn
            || prevProps.fileIndex === -1;

        if (endingCriteria) {
            return;
        }
        this.fileEditsQueue.push({
            fileName: prevProps.fileName,
            fileIndex: prevProps.fileIndex,
            code: prevProps.code,
        });
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
            this.triggerFileLoadingAnim();
            this.debouncedSaveCodeCloud();
        }
        this.props.saveCode(this.props.fileIndex, code);

    };

    render() {
        const { code } = this.props;

        const options: monacoEditor.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            mouseWheelZoom: true,
            fontSize: 18,
            fontFamily: 'Fira Mono',
            minimap: {
                enabled: false,
            },
            // scrollBeyondLastLine: false,
        };

        return (
            <div style={{ height: '100%', width: '100%' }}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                <MonacoEditor
                    language="elementaryjs"
                    theme="vs-dark"
                    value={code}
                    options={options}
                    onChange={this.onChange}
                    editorDidMount={this.editorDidMount}
                    editorWillMount={this.editorWillMount}
                    height="calc(100% - 48px)"
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
    setEditor: (editor: monacoEditor.editor.IStandaloneCodeEditor) => {
        dispatch(setMonacoEditor(editor))
    },
    triggerFileLoading: (fileIndex: number) => { dispatch(markFileNotSaved(fileIndex)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeEditor);