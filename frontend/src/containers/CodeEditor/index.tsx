import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import ReactResizeDetector from 'react-resize-detector';
import { debounce } from 'lodash';
import elemjshighlight from './elemjsHighlighter';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import PawIcon from '@material-ui/icons/Pets';
import Typography from '@material-ui/core/Typography';
import * as state from '../../state';
import { isFailureResponse, FileChange } from '../../utils/api/apiHelpers';
import { saveChanges } from '../../utils/api/saveFileChanges';

const debounceWait = 500; // milliseconds;

const styles: StyleRulesCallback = theme => ({
    emptyState: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', /* Vertical center alignment */
        justifyContent: 'center', /* Horizontal center alignment */
    },
    pawIcon: {
        fontSize: '8em',
        color: theme.palette.primary.contrastText,
        opacity: 0.4,
        marginBottom: '0.3em',
    }
});

const monacoOptions: monacoEditor.editor.IEditorConstructionOptions = {
    selectOnLineNumbers: true,
    mouseWheelZoom: true,
    fontSize: 14,
    fontFamily: 'Fira Mono',
    autoIndent: true,
    folding: false,
    minimap: {
        enabled: false,
    },
    renderIndentGuides: false
    // scrollBeyondLastLine: false,
};

type Props = {
    openMustLogin: () => void,
} & WithStyles<'emptyState' | 'pawIcon'>;

type FileEdit = {
    fileName: string,
    fileIndex: number,
    code: string,
    loggedIn: boolean
};

type CodeEditorState = {
    loggedIn: boolean,
    selectedFileIndex: number
};

class CodeEditor extends React.Component<Props, CodeEditorState> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    fileEditsQueue: FileEdit[];
    constructor(props: Props) {
        super(props);
        this.editor = undefined;
        this.fileEditsQueue = [];
        this.state = {
            loggedIn: state.loggedIn.getValue(),
            selectedFileIndex: state.selectedFileIndex.getValue()
        };
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ loggedIn: x }));
        state.selectedFileIndex.subscribe(x => this.setState({ selectedFileIndex: x }));
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
                increaseIndentPattern: /^.*\{[^}\"']*$/,
                decreaseIndentPattern: /^(.*\*\/)?\s*\}[;\s]*$/
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
        state.editor.next(editor);
        editor.focus();
        editor.getModel().updateOptions({ tabSize: 2 }); // what if there are different models?
        if (window.location.hostname === 'localhost') {
            const code = window.localStorage.getItem('code');
            if (code !== null) {
                editor.setValue(code);
            }
        }
        this.editor = editor;
        const mustLogin = window.location.search !== '?anonymous';
        if (!this.state.loggedIn && mustLogin) {
            editor.onKeyDown(event => {
                if (mustLogin && !this.state.loggedIn) {
                    this.props.openMustLogin();
                }
            });
        }
    }

    componentDidUpdate(prevProps: Props, prevState: CodeEditorState) {
        if (this.editor === undefined) {
            return;
        }

        if (prevState.selectedFileIndex !== this.state.selectedFileIndex) {
            this.editor.setValue(state.currentProgram.getValue());
        }

        this.fileEditsQueue.push({
            loggedIn: this.state.loggedIn,
            fileName: state.currentFileName(),
            fileIndex: this.state.selectedFileIndex,
            code: this.editor.getValue()
        });
        this.editor.focus();
    }

    handleResize = () => {
        if (typeof this.editor === 'undefined') {
            return;
        }
        this.editor.layout();
    }

    saveCodeCloud(fileName: string, fileIndex: number, code: string) {
        console.log('Saving code to cloud!');
        const change: FileChange[] = [
          {
            fileName: fileName,
            type: 'create',
            changes: code,
          }
        ];
        saveChanges(change).then((response) => {
          if (isFailureResponse(response)) {
            console.log('Could not save to cloud');
          }
          console.log('Saved to cloud!');
        }).catch((err) => console.log('An error occurred!', err));
      };
    
    saveCodeCloudWrapper()  {
        let fileEdit: FileEdit;
        console.log('Saving code');
        while (this.fileEditsQueue.length > 0) {
            console.log('In loop');
            fileEdit = this.fileEditsQueue.shift() as FileEdit;
            if (fileEdit.fileIndex === this.state.selectedFileIndex) {
                continue;
            }
            this.saveCodeCloud(
                fileEdit.fileName,
                fileEdit.fileIndex,
                fileEdit.code);
        }
        this.saveCodeCloud(
            state.currentFileName(),
            this.state.selectedFileIndex,
            state.currentProgram.getValue());

    };

    debouncedSaveCodeCloud = debounce(() => this.saveCodeCloudWrapper(), debounceWait);

    onChange(code: string)  {
        if (this.state.loggedIn) {
            this.debouncedSaveCodeCloud();
        }
        state.currentProgram.next(code);
        const oldFiles = state.files.getValue();
        const files = oldFiles.map((file, index) => {
            if (index === this.state.selectedFileIndex) {
                return { content: code, name: file.name }
            }
            else {
                return file;
            }
        });
        state.files.next(files);
    };

    render() {
        const { classes } = this.props;

        if (this.state.selectedFileIndex < 0) {
            return (
                <div className={classes.emptyState}>
                    <PawIcon className={classes.pawIcon} />
                    <Typography variant="subheading" align="center" style={{opacity: 0.4}}>
                        Select/Create a file to get started
                    </Typography>
                </div>
            );
        }

        monacoOptions.readOnly = !this.state.loggedIn;

        return (
            <div style={{ height: '100%', width: '100%' }}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                <MonacoEditor
                    language="elementaryjs"
                    theme="vs-dark"
                    value={state.currentProgram.getValue()}
                    options={monacoOptions}
                    onChange={(code) => this.onChange(code)}
                    editorDidMount={this.editorDidMount}
                    editorWillMount={this.editorWillMount}
                />
            </div >
        );
    }
}

export default withStyles(styles)(CodeEditor);