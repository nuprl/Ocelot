import * as React from 'react';
import { WithStyles, withStyles, StyleRulesCallback, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import './../styles/Jumbotron.css';

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
    code: string
};

class Jumbotron extends React.Component<WithStyles<string>, State> {

    state = {
        code: '// type your code...',
    };

    editor: any;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        // tslint:disable-next-line:no-console
        console.log('editorDidMount', editor);
        editor.focus();
        this.editor = editor;
    }

    // onChange = (newValue: string, event: monacoEditor.editor.IModelContentChangedEvent) => {
    //     // tslint:disable-next-line:no-console
    //     console.log('onChange', newValue, event);
    // }

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
            mouseWheelZoom: true
        };

        const { classes } = this.props;

        return (
            <div className="jumboContainer">
                <div className={classes.toolbar} />
                <div className="col">
                    <Button color="secondary" className={classes.button}>
                        Run
                    </Button>
                    <MuiThemeProvider theme={tempTheme}>
                        <Button color="primary" className={classes.button}>
                            Stop
                        </Button>
                    </MuiThemeProvider>
                    <MonacoEditor // using this causes errors during development
                        // but the production works fine so it's okay.
                        language="javascript"
                        theme="vs-dark"
                        // value={code}
                        options={options}
                        // onChange={this.onChange}
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