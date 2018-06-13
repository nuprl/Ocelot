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
    cursorStyle: 'line-thin',
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
    fontFamily: 'Fira Mono, monospace',
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

class ConsoleInput extends React.Component<WithStyles<string>> {

    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined = undefined;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        // tslint:disable-next-line:no-console
        window.addEventListener('resize', this.resizeEditor);
    }

    resizeEditor = () => {
        if (this.editor !== undefined) {
            this.editor.layout();
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.container}>
                <div style={{color: 'white', height: '24px'}}>
                    <RightArrowIcon color="inherit"/>
                </div>
                <div style={{ verticalAlign: 'middle', width: '100%', height: '20px' }}>
                    <MonacoEditor
                        options={monacoOptions}
                    />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(ConsoleInput);