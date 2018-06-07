import * as React from 'react';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import PanelGroup from 'react-panelgroup';
// import ReactResizeDetector from 'react-resize-detector';

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
    col: {
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
    editorWidth: number;
};

class Jumbotron extends React.Component<WithStyles<string> & Props, State> {

    constructor(props: WithStyles<string> & Props) {
        super(props);
        this.state = {
            code: '// type your code...',
            runner: undefined,
            editorWidth: 300,
        };
    }

    editor: any;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        // tslint:disable-next-line:no-console
        console.log('editorDidMount', editor);
        editor.focus();
        this.editor = editor;
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
        // tslint:disable-next-line:no-console
        // console.log(panelWidths);
        // if (panelWidths) {
        //     this.setState({editorWidth: panelWidths[0].size});
        // }

    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

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
        const { runner, } = this.state;

        return (
            <div className={classes.jumboContainer}>
                <div className={classes.toolbar} />
                <PanelGroup panelWidths={[{minSize: 200}]} onUpdate={this.handleResize}>
                    <div className={classes.col}>
                        {/* <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} /> */}
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
                    <div className={classes.col}>
                        <canvas />
                    </div>
                </PanelGroup>
            </div>
        );
    }
}

export default withStyles(styles)(Jumbotron);