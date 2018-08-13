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
    fileInfo: {
        code: string,
        fileName: string,
        enabled: boolean,
        fileIndex: number,
    },
    updateCode: (code: string) => void,
    saveCode: (
        fileIndex: number,
        content: string,
    ) => void,
    saveCodeCloud: (
        fileName: string,
        fileIndex: number,
        content: string,
        loggedIn: boolean,
    ) => void,
    openMustLogin: () => void,
} & WithStyles<'emptyState' | 'pawIcon'>;

type FileEdit = {
    fileName: string,
    fileIndex: number,
    code: string,
    loggedIn: boolean
};

class CodeEditor extends React.Component<Props, { loggedIn: boolean }> {
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    fileEditsQueue: FileEdit[];
    constructor(props: Props) {
        super(props);
        this.editor = undefined;
        this.fileEditsQueue = [];
        this.state = {
            loggedIn: state.loggedIn.getValue()
        };
    }

    componentDidMount() {
        state.loggedIn.subscribe(x => this.setState({ loggedIn: x }));
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

    componentDidUpdate(prevProps: Props) {
        if (this.editor === undefined) {
            return;
        }
        if (prevProps.fileInfo.fileIndex !== this.props.fileInfo.fileIndex) {
            this.props.updateCode(this.props.fileInfo.code);
        }
        const endingCriteria = prevProps.fileInfo.fileIndex === this.props.fileInfo.fileIndex
            || prevProps.fileInfo.fileIndex === -1;

        if (endingCriteria) {
            return;
        }
        this.fileEditsQueue.push({
            loggedIn: this.state.loggedIn,
            fileName: prevProps.fileInfo.fileName,
            fileIndex: prevProps.fileInfo.fileIndex,
            code: prevProps.fileInfo.code,
        });
        this.editor.focus();
    }

    handleResize = () => {
        if (typeof this.editor === 'undefined') {
            return;
        }
        this.editor.layout();
    }

    saveCodeCloudWrapper = () => {
        // tslint:disable-next-line:no-console
        let fileEdit: FileEdit;
        console.log('Saving code');
        while (this.fileEditsQueue.length > 0) {
            console.log('In loop');
            fileEdit = this.fileEditsQueue.shift() as FileEdit;
            if (fileEdit.fileIndex === this.props.fileInfo.fileIndex) {
                continue;
            }
            this.props.saveCodeCloud(
                fileEdit.fileName,
                fileEdit.fileIndex,
                fileEdit.code,
                this.state.loggedIn
            );
        }
        this.props.saveCodeCloud(
            this.props.fileInfo.fileName,
            this.props.fileInfo.fileIndex,
            this.props.fileInfo.code,
            this.state.loggedIn
        );

    };

    debouncedSaveCodeCloud = debounce(this.saveCodeCloudWrapper, debounceWait);

    onChange = (code: string) => {
        if (this.state.loggedIn) {
            this.debouncedSaveCodeCloud();
        }
        this.props.updateCode(code);
        this.props.saveCode(this.props.fileInfo.fileIndex, code);

    };

    render() {
        const { fileInfo, classes } = this.props;
        const loggedIn = this.state.loggedIn;
        const { code, enabled } = fileInfo;

        if (!enabled) {
            return (
                <div className={classes.emptyState}>
                    <PawIcon className={classes.pawIcon} />
                    <Typography variant="subheading" align="center" style={{opacity: 0.4}}>
                        Select/Create a file to get started
                    </Typography>
                </div>
            );
        }

        if (!loggedIn) {
            const mustLogin = window.location.search !== '?anonymous';
            monacoOptions.readOnly = mustLogin && !this.state.loggedIn;
        }

        if (loggedIn) {
            monacoOptions.readOnly = false;
        }

        return (
            <div style={{ height: '100%', width: '100%' }}>
                <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                <MonacoEditor
                    language="elementaryjs"
                    theme="vs-dark"
                    value={code}
                    options={monacoOptions}
                    onChange={this.onChange}
                    editorDidMount={this.editorDidMount}
                    editorWillMount={this.editorWillMount}
                />
            </div >
        );
    }
}

export default withStyles(styles)(CodeEditor);