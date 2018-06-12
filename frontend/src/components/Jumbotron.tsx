import * as React from 'react';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import PanelGroup from './../modifiedNodeModules/PanelGroup';
import ConsoleTabs from './ConsoleTabs';
import Typography from '@material-ui/core/Typography';
import ReactResizeDetector from 'react-resize-detector';

declare const stopify: any; // TODO(arjun): we need to fix this

const styles: StyleRulesCallback = theme => ({
    toolbar: theme.mixins.toolbar,
    button: {
        margin: theme.spacing.unit,
    },
    jumboContainer: {
        flexGrow: 1,
        display: 'flex',
        height: '100%',
        minWidth: '0',
    },
    panel: {
        flex: 1,
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
        const container = document.getElementsByClassName(props.classes.jumboContainer)[0];
        // tslint:disable-next-line:no-console
        console.log(container);

        this.state = {
            code: '// type your code...',
            runner: undefined,
            editorWidth: 500,
            consoleHeight: 110,
        };
    }

    editor: any;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        // tslint:disable-next-line:no-console
        console.log('editorDidMount', editor);
        editor.focus();
        this.editor = editor;
        editor.addCommand(
            // tslint:disable-next-line:no-bitwise
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
            function () {
                // tslint:disable-next-line:no-console
                console.log('SAVE pressed!');
            },
            '');
    }

    onChange = (code: string) => {
        this.setState({ code: code });
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

    // componentDidMount() {
    //     window.addEventListener('resize', this.handleResize);
    // }

    componentDidUpdate(prevProps: WithStyles<string> & Props) {
        // involved right after updating, has more parameters if needed
        if (prevProps.selectedFileIndex !== this.props.selectedFileIndex && this.props.selectedFileIndex > -1) {
            const selectedFileCode = this.props.files[this.props.selectedFileIndex].content;
            this.setState({ code: selectedFileCode });
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
        const { runner, editorWidth, consoleHeight } = this.state;

        return (
            <div className={classes.jumboContainer} onMouseUp={this.saveDimensions}>
                <div className={classes.toolbar} />
                <PanelGroup
                    direction="column"
                    panelWidths={[{}, { resize: 'dynamic', size: consoleHeight, minSize: 110 }]}
                    borderColor="#201e1e"
                    spacing={4}
                    onUpdate={this.handleResize}
                >
                    <PanelGroup
                        direction="row"
                        panelWidths={[{ minSize: 200, resize: 'dynamic', size: editorWidth }]}
                        borderColor="#aaa"
                        spacing={4}
                        onUpdate={this.handleResize}
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
                        <div className={classes.panel} style={{ backgroundColor: '#ccc' }}>
                            <Typography
                                variant="display3"
                            >
                                WELP
                            </Typography>
                        </div>
                    </PanelGroup>
                    <div id="webconsole" className={classes.panel}>
                        <ConsoleTabs />
                    </div>
                </PanelGroup>
            </div>
        );
    }
}

export default withStyles(styles)(Jumbotron);