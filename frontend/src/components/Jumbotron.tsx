import * as React from 'react';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
// import PanelGroup from './../modifiedNodeModules/PanelGroup';
import ConsoleTabs from './ConsoleTabs';
import Typography from '@material-ui/core/Typography';
import ReactResizeDetector from 'react-resize-detector';
import SplitPane from 'react-split-pane';
import '../styles/SplitPane.css';

declare const stopify: any; // TODO(arjun): we need to fix this

const styles: StyleRulesCallback = theme => ({
    toolbar: theme.mixins.toolbar,
    button: {
        margin: theme.spacing.unit,
    },
    panel: {
        width: '100%',
        height: '100%',
    }
});

const tempTheme = createMuiTheme({
    palette: {
        primary: red,
    }
});

type Props = {
    files: { name: string, content: string }[],
    selectedFileIndex: number,
    onUpdateSelectedFile: (index: number, content: string) => void,
    onSaveSelectedFile: (fileIndex: number, fileName: string) => void,
    loggedIn: boolean;
};

type State = {
    code: string,
    runner: any,
    editorWidth: number,
    consoleHeight: number,
};

class Jumbotron extends React.Component<WithStyles<string> & Props, State> {

    constructor(props: WithStyles<string> & Props) {
        super(props);

        this.state = {
            code: '// type your code...',
            runner: undefined,
            editorWidth: Math.floor(1920 / 2.1),
            consoleHeight: 110,
        };
    }

    editor: any;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        // tslint:disable-next-line:no-console
        console.log('editorDidMount', editor);
        editor.focus();
        this.editor = editor;
        const onCtrlSave = () => {
            if (this.props.selectedFileIndex < 0
                || this.props.selectedFileIndex > this.props.files.length - 1) {
                return;
            }
            this.props.onSaveSelectedFile(
                this.props.selectedFileIndex,
                this.props.files[this.props.selectedFileIndex].name
            );
        };
        editor.addCommand(
            // tslint:disable-next-line:no-bitwise
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
            function () {
                // tslint:disable-next-line:no-console
                onCtrlSave();
            },
            '');
    }

    componentDidMount() {
        this.setState({ editorWidth: document.body.clientWidth / 2.1 });
    }

    onChange = (code: string) => {
        this.setState({ code: code });
        const { selectedFileIndex } = this.props;
        if (this.props.selectedFileIndex > -1) {
            this.props.onUpdateSelectedFile(selectedFileIndex, code);
        }
    }

    onRunClick = () => {
        const runner = stopify.stopifyLocally(
            this.state.code,
            {
                externals: ['console']
            },
            {
                estimator: 'countdown',
                yieldInterval: 1
            });
        this.setState({ runner: runner });
        runner.run((result: any) => {
            // tslint:disable-next-line:no-console
            console.log(result);
            this.setState({ runner: undefined });
        });
    }

    onStopClick = () => {
        const runner = this.state.runner;
        if (typeof runner === 'undefined') {
            throw new Error(`no runner found (stop should be disabled)`);
        }
        runner.pause((line?: number) => {
            // tslint:disable-next-line:no-console
            console.log('stopped');
            this.setState({ runner: undefined });
        });
    }

    handleResize = (panelWidths: any) => {
        if (this.editor !== null) {
            this.editor.layout();
        }
    }

    saveDimensions = () => {
        const editor = document.getElementById('editorio');
        const webConsole = document.getElementById('webconsole');
        if (editor !== null) {
            this.setState({ editorWidth: editor.clientWidth });
        }
        if (webConsole !== null) {
            this.setState({ consoleHeight: webConsole.clientHeight });
        }

    }

    componentDidUpdate(prevProps: WithStyles<string> & Props) {
        // involved right after updating, has more parameters if needed
        if (prevProps.selectedFileIndex !== this.props.selectedFileIndex && this.props.selectedFileIndex > -1) {
            const selectedFileCode = this.props.files[this.props.selectedFileIndex].content;
            this.setState({ code: selectedFileCode });
        }
        if (prevProps.loggedIn && !this.props.loggedIn) {
            this.setState({ code: '// type your code here' });
        }

    }

    render() {
        const { code } = this.state;
        const options: monacoEditor.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            mouseWheelZoom: true,
            fontSize: 18,
        };

        const { classes, } = this.props;
        const { runner, /* editorWidth, consoleHeight*/ } = this.state;

        return (
            <SplitPane
                split="horizontal"
                minSize={48}
                defaultSize={48}
                primary="second"
            >
                <SplitPane
                    split="vertical"
                    minSize={200}
                    defaultSize="50%"
                >
                    <div className={classes.panel} id="editorio">
                        <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
                        <Button
                            style={{ display: runner === undefined ? 'inline-block' : 'none' }}
                            color="secondary"
                            className={classes.button}
                            onClick={this.onRunClick}
                        >
                            Run
                        </Button>
                        <MuiThemeProvider theme={tempTheme}>
                            <Button
                                style={{ display: runner === undefined ? 'none' : 'inline-block' }}
                                color="primary"
                                className={classes.button}
                                onClick={this.onStopClick}
                            >
                                Stop
                            </Button>
                        </MuiThemeProvider>
                        <MonacoEditor // refreshing breaks it (something to do with cache and webworkers)
                            language="javascript"
                            theme="vs-dark"
                            value={code}
                            options={options}
                            onChange={this.onChange}
                            editorDidMount={this.editorDidMount}
                        />
                    </div>
                    <div className={classes.panel} style={{ backgroundColor: '#555' }}>
                        <Typography
                            variant="display3"
                        >
                            Test
                        </Typography>
                    </div>
                </SplitPane>
                <div id="webconsole" className={classes.panel}>
                    <ConsoleTabs />
                </div>
            </SplitPane>
        );
    }
}

export default withStyles(styles)(Jumbotron);