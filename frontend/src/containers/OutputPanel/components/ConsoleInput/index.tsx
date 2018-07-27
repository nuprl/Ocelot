import * as React from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import RightArrowIcon from '@material-ui/icons/KeyboardArrowRight';

const monacoOptions: monacoEditor.editor.IEditorConstructionOptions = {
    language: 'javascript',
    wordWrap: 'on',
    overviewRulerLanes: 0,
    glyphMargin: false,
    lineNumbers: 'off',
    folding: false,
    selectOnLineNumbers: false,
    selectionHighlight: false,
    // cursorStyle: 'line-thin',
    scrollbar: {
        useShadows: false,
        horizontal: 'hidden',
        verticalScrollbarSize: 9,
    },
    lineDecorationsWidth: 0,
    scrollBeyondLastLine: false,
    renderLineHighlight: 'none',
    minimap: {
        enabled: false,
    },
    contextmenu: false,
    ariaLabel: 'ConsoleInput',
    fontFamily: 'Fira Mono',
    fontSize: 16,
};

const styles: StyleRulesCallback = theme => ({
    container: {
        width: '100%',
        padding: '8px',
        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
    }

});

type Props = { onOutput: (command: string, result: string, isError: boolean) => void };

class ConsoleInput extends React.Component<WithStyles<string> & Props> {
    evalContext: (x: string) => any = eval;
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined = undefined;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        window.addEventListener('resize', this.resizeEditor);
        editor.onKeyDown(event => {
            // tslint:disable-next-line:no-console
            if (event.keyCode === monaco.KeyCode.Enter && editor.getValue() !== '') {
                event.preventDefault();
                event.stopPropagation();
                const command = editor.getValue();
                editor.setValue('');
                try {
                    // tslint:disable-next-line:no-eval
                    const result = this.evalContext(command); // this is pretty bad
                    // pretty unsafe.
                    this.props.onOutput(command, result, false);
                } catch (e) {
                    this.props.onOutput(command, `${e.name}: ${e.message}` , true);
                }
                
            } 
        });
    }

    resizeEditor = () => {
        if (this.editor !== undefined) {
            this.editor.layout();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeEditor);
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.container}>
                <div style={{ color: 'white', height: '24px' }}>
                    <RightArrowIcon color="inherit" />
                </div>
                <div style={{ verticalAlign: 'middle', width: '100%', height: '20px' }}>
                    <MonacoEditor
                        theme="vs-dark"
                        language="elementaryjs"
                        options={monacoOptions}
                        editorDidMount={this.editorDidMount}
                    />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ConsoleInput);