import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import ReactResizeDetector from 'react-resize-detector';
import elemjshighlight from './elemjsHighlighter';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import PawIcon from '@material-ui/icons/Pets';
import Typography from '@material-ui/core/Typography';
import * as state from '../../state';
import { console } from '../../errors';
import { connect } from '../../reactrx';
import { Sandbox } from '../../sandbox';

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
    renderIndentGuides: true
    // scrollBeyondLastLine: false,
};

type Props = {
    sandbox: Sandbox,
    openMustLogin: () => void,
} & WithStyles<'emptyState' | 'pawIcon'>;

type CodeEditorState = {
    uiActive: boolean,
    loadProgram: state.Program
};

class CodeEditor extends React.Component<Props, CodeEditorState> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;

    constructor(props: Props) {
        super(props);
        this.editor = undefined;
        this.state = {
            uiActive: state.uiActive.getValue(),
            // On initialization, this will be nothing
            loadProgram: state.currentProgram.getValue()
        };
        connect(this, 'uiActive', state.uiActive);
        connect(this, 'loadProgram', state.loadProgram);
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
        editor.getModel().updateOptions({ tabSize: 2 });
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
            // students can accidentally press ctrl/cmd + s, this prevents default action
        }, '');
        let codeEditor = this;
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
            // Ctrl + Enter: Run code
            codeEditor.props.sandbox.onRunOrTestClicked('running');
        }, '');
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, function() {
            // Ctrl + Shift + Enter: Run tests
            codeEditor.props.sandbox.onRunOrTestClicked('testing');
        }, '');
        this.editor = editor;
        
        const mustLogin = window.location.search !== '?anonymous';
        if (!this.state.uiActive && mustLogin) {
            editor.onKeyDown(event => {
                if (mustLogin && !this.state.uiActive) {
                    this.props.openMustLogin();
                }
            });
        }
    }

    componentDidUpdate(prevProps: Props, prevState: CodeEditorState) {
        if (this.editor === undefined) {
            return;
        }
        state.currentProgram.next(this.state.loadProgram);
        this.editor.focus();
    }

    handleResize = () => {
        if (typeof this.editor === 'undefined') {
            return;
        }
        this.editor.layout();
    }
    
    onChange(code: string)  {
        if (this.state.loadProgram.kind !== 'program') {
            console.error('editor received onChange without a loaded program');
            return;
        }
        state.currentProgram.next({
            kind: 'program',
            name: this.state.loadProgram.name,
            content: code
        });
        state.dirty.next('dirty');
    };

    render() {
        const { classes } = this.props;

        if (this.state.loadProgram.kind !== 'program') {
            return (
                <div className={classes.emptyState}>
                    <PawIcon className={classes.pawIcon} />
                    <Typography variant="subheading" align="center" style={{opacity: 0.4}}>
                        Select/Create a file to get started
                    </Typography>
                </div>
            );
        }

        monacoOptions.readOnly = !this.state.uiActive;

        return (
            <div style={{ height: '100%', width: '100%' }}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                <MonacoEditor
                    language="elementaryjs"
                    theme="vs-dark"
                    value={this.state.loadProgram.content}
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