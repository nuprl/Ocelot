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
import { saveHistory } from '../../utils/api/saveHistory'
import { isFailureResponse } from '../../utils/api/apiHelpers';

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
    fontSize: 14,
    fontFamily: 'Fira Mono',
    autoIndent: true,
    folding: false,
    minimap: {
        enabled: false,
    },
    renderIndentGuides: true,
    contextmenu: false
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
    fontSize: number = 14;

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
        monaco.editor.defineTheme('sudoTheme', {
            base: 'vs-dark', // can also be vs-dark or hc-black
            inherit: true, // can also be false to completely replace the builtin rules
            rules: [],
            colors: {
                ["editor.background"]: '#400000',
            }
        } as monacoEditor.editor.IStandaloneThemeData);
    };

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        editor.focus();
        editor.getModel().updateOptions({ tabSize: 2 });
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
            // students can accidentally press ctrl/cmd + s, this prevents default action
        }, '');
        editor.addCommand(monaco.KeyCode.F1, () => {}, '');

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow, () => {
            this.fontSize = Math.min(this.fontSize + 1, 40);
            editor.updateOptions({ fontSize: this.fontSize})
        }, '');

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow, () => {
            this.fontSize = Math.max(this.fontSize - 1, 1);
            editor.updateOptions({ fontSize: this.fontSize})
        }, '');

        let codeEditor = this;
        let saveCode = function() {
            const program = state.currentProgram.getValue();
            if (program.kind !== 'program') return;
            saveHistory(program.name, program.content).then((res) => {
                if (isFailureResponse(res)) {
                  state.notify('Failed to save history');
                  return;
                }
              })
              .catch(err => console.log(err));
        }
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
            // Ctrl + Enter: Run code
            saveCode();
            codeEditor.props.sandbox.onRunOrTestClicked('running');
        }, '');
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, function() {
            // Ctrl + Shift + Enter: Run tests
            saveCode();
            codeEditor.props.sandbox.onRunOrTestClicked('testing');
        }, '');
        this.editor = editor;
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
        if (state.loggedIn.getValue().kind === 'logged-out') {
            return;
        }
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


        return (
            <div style={{ height: '100%', width: '100%' }}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                <MonacoEditor
                    language="elementaryjs"
                    theme="vs-dark" // Change to sudoTheme when state.isSudo is true.
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