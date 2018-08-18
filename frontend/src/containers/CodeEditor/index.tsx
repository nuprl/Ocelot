import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import ReactResizeDetector from 'react-resize-detector';
import elemjshighlight from './elemjsHighlighter';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import PawIcon from '@material-ui/icons/Pets';
import Typography from '@material-ui/core/Typography';
import * as state from '../../state';
import EJSWorker = require('worker-loader?name=[name].js!./ejs.worker');
import { debounce } from 'lodash';

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
    contextmenu: false,
    selectOnLineNumbers: true,
    mouseWheelZoom: true,
    fontSize: 14,
    fontFamily: 'Fira Mono',
    autoIndent: true,
    folding: false,
    minimap: {
        enabled: false,
    },
    renderIndentGuides: false,
    // scrollBeyondLastLine: false,
};

type Props = {
    openMustLogin: () => void,
} & WithStyles<'emptyState' | 'pawIcon'>;

type CodeEditorState = {
    uiActive: boolean,
    loadProgram: string | false
};

class CodeEditor extends React.Component<Props, CodeEditorState> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    worker: Worker

    constructor(props: Props) {
        super(props);
        this.editor = undefined;
        this.state = {
            uiActive: state.uiActive.getValue(),
            loadProgram: ''
        };
        this.worker = new EJSWorker();
    }

    componentDidMount() {
        state.uiActive.subscribe(x => this.setState({ uiActive: x }));
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
        editor.getModel().updateOptions({ tabSize: 2 });
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
            // students can accidentally press ctrl/cmd + s, this prevents default action
        }, '');
        editor.addCommand(monaco.KeyCode.F1, function() {
            // override command palette shortcut;
        }, '');

        this.worker.addEventListener('message', event => {
            let { markers } = event.data;
            if (markers.length > 0 && markers[0].message.includes('Unexpected token')) {
                let oldMarkers = monaco.editor.getModelMarkers({owner: 'ejs-compile'});
                oldMarkers.push(...markers); // push new markers to old markers
                markers = oldMarkers; // replace 
            }
            monaco.editor.setModelMarkers(editor.getModel(), 'ejs-compile', []);
            monaco.editor.setModelMarkers(editor.getModel(), 'ejs-compile', markers);
        });

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
        const program = this.state.loadProgram;
        if (program !== false) {
            state.currentProgram.next(program);
        }

        this.editor.focus();
    }

    handleResize = () => {
        if (typeof this.editor === 'undefined') {
            return;
        }
        this.editor.layout();
    }

    debouncedCompile = debounce(() => {
        this.worker.postMessage({
            code: state.currentProgram.getValue(),
        });
    }, 500);
    
    onChange(code: string)  {
        state.currentProgram.next(code);
        state.dirty.next('dirty');
        const oldFiles = state.files.getValue();
        const index = state.selectedFileIndex.getValue();
        const files = oldFiles.map((file, i) => {
            if (i === index) {
                return { content: code, name: file.name }
            }
            else {
                return file;
            }
        });
        state.files.next(files);
        this.debouncedCompile();
    };

    render() {
        const { classes } = this.props;

        if (this.state.loadProgram === false) {
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