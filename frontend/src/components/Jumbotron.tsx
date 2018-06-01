import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback } from '@material-ui/core/styles/withStyles';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';

const styles: StyleRulesCallback = theme => ({
    jumboContainer: {
        display: 'flex',
        overflow: 'hidden',
        height: 'calc(100vh - 64px)',
    },
    col: {
        flex: 1,
        height: '100%',
        width: '50%',
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

        const { classes } = this.props;
        // const { code } = this.state;
        const options: monacoEditor.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            mouseWheelZoom: true
        };

        return (
            <div className={classes.jumboContainer}>
                <div className={classes.col}>
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
                <div className={classes.col}>
                    <canvas />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Jumbotron);