import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import ReactResizeDetector from 'react-resize-detector';
import elemjshighlight from './elemjsHighlighter';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import PawIcon from '@material-ui/icons/Pets';
import Typography from '@material-ui/core/Typography';
import * as state from '../../state';

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

type CodeEditorState = {
    loggedIn: boolean,
    selectedFileIndex: number,
    loadProgram: string
};

class CodeEditor extends React.Component<Props, CodeEditorState> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    maskChange: boolean;

    constructor(props: Props) {
        super(props);
        this.editor = undefined;
        this.maskChange = true;
        this.state = {
            loggedIn: state.loggedIn.getValue(),
            selectedFileIndex: state.selectedFileIndex.getValue(),
            loadProgram: ''
        };
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ loggedIn: x }));
        state.selectedFileIndex.subscribe(x => this.setState({ selectedFileIndex: x }));
        state.loadProgram.subscribe(x => this.setState({ loadProgram: x }));
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
        editor.focus();
        editor.getModel().updateOptions({ tabSize: 2 }); // what if there are different models?
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

            if (this.state.selectedFileIndex !== -1) {
                this.maskChange = true;
                const content = state.files.getValue()[this.state.selectedFileIndex].content;
                state.loadProgram.next(content);
                state.currentProgram.next(content);
            }
        }

        this.editor.focus();
    }

    handleResize = () => {
        if (typeof this.editor === 'undefined') {
            return;
        }
        this.editor.layout();
    }
    
    onChange(code: string)  {
        if (this.maskChange) {
            this.maskChange = false;
            return;
        }
        state.isBufferSaved.next(false);
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
                    value={this.state.loadProgram}
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