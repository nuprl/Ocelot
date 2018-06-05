import * as React from 'react';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import './../styles/Jumbotron.css';

declare const stopify: any; // TODO(arjun): we need to fix this

const styles: StyleRulesCallback = theme => ({
    toolbar: theme.mixins.toolbar,
    button: {
        margin: theme.spacing.unit,
    }
});

const tempTheme = createMuiTheme({
    palette: {
        primary: red,
    }
});

type State = {
    code: string,
    runner: any
};

class Jumbotron extends React.Component<WithStyles<string>, State> {

    constructor(props: WithStyles<string>) {
        super(props);
        this.state = {
            code: '// type your code...',
            runner: undefined
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

    handleResize = () => {
        if (this.editor !== null) {
            this.editor.layout();
            // tslint:disable-next-line:no-console
            console.log(this.state.code);
        }

    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    render() {
        // const { code } = this.state;
        const options: monacoEditor.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            mouseWheelZoom: true,
            fontSize: 18,
        };

        const { classes } = this.props;
        const { runner } = this.state;

        return (
            <div className="jumboContainer">
                <div className={classes.toolbar} />
                <div className="col">
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
                        // value={code}
                        options={options}
                        onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />
                </div>
                <div className="col">
                    <canvas />
                </div>
                {/* <Typography noWrap>{'You think water moves fast? You should see ice.'}</Typography> */}
            </div>
        );
    }
}

export default withStyles(styles)(Jumbotron);