import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import { Hook, Decode } from 'console-feed';
import 'static/styles/ConsoleTabs.css';
import { Message } from 'console-feed/lib/definitions/Console';
import { Message as FullMessage } from 'console-feed/lib/definitions/Component';

import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import RightArrowIcon from '@material-ui/icons/KeyboardArrowRight';

import { Console } from 'console-feed';
import { inspectorTheme } from './static/styles/consoleStyle';
import 'static/styles/Scrollbar.css';
import { AsyncRun } from 'stopify';
import * as stopify from 'stopify';

class ConsoleOutput extends React.Component<{ logs: FullMessage[] }> {
  logRef: HTMLDivElement | null = null;

  componentDidUpdate() {
    if (this.logRef !== null) {
      this.logRef.scrollTop = this.logRef.scrollHeight;
    }
  }

  render() {
    const { logs } = this.props;

    return (
      <div className="scrollbars"
           style={{ 
               backgroundColor: '#242424', 
               overflowY: 'auto', 
               overflowX: 'hidden', 
               flexGrow: 1 }}
           ref={(divElem) => this.logRef = divElem}>
         <Console logs={logs} variant="dark" styles={inspectorTheme}/>
      </div>
    );
  }

}

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

const s1 = {
    width: '100%',
    padding: '8px',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    backgroundColor: '#1e1e1e'
};

const styles: StyleRulesCallback = theme => ({
    root: {
        borderTop: '1px solid white',
        flexGrow: 1,
        backgroundColor: theme.palette.primary.light,
        height: '100%',
        width: '100%'
    },
});

type Props = WithStyles<'root'> & {
    runner: AsyncRun | undefined
}

type State = {
    logs: Message[],
};

class OutputPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            logs: []
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        // Clear console when program reloads.
        if (nextProps.runner !== this.props.runner) {
            this.setState({ logs: [] });
        }
    }

    /** Appends a message to the log. Bounds scrollback to 100 items. */
    appendLogMessage(message: Message | { method: 'command' | 'result' | 'error', data: any }) {
        let newLog = [...this.state.logs, message as Message];
        if (newLog.length > 100) {
            newLog = newLog.slice(newLog.length - 100);
        }
        this.setState({ logs: newLog });
    }

    componentDidMount() {
        Hook(window.console, (log: any) => {
            const decodedLog = Decode(log);
            if (typeof decodedLog.data !== 'object') {
                return;
            }

            if (decodedLog.data.length === 0) { // prevent console.log() from logging
                return;
            }
            this.appendLogMessage(decodedLog);
        });
    }

    addNewCommandResult = (command: string, result: any, isError: boolean) => {
        this.appendLogMessage({ method: 'command', data: [command] });
        this.appendLogMessage({method: isError ? 'error': 'result', data: [result]});
    };

    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined = undefined;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        window.addEventListener('resize', this.resizeEditor);
        editor.onKeyDown(event => {
            if (!(event.keyCode === monaco.KeyCode.Enter && editor.getValue() !== '')) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const command = editor.getValue();
            editor.setValue('');

            const runner = this.props.runner;
            if (runner === undefined) {
                console.error('Need to click run (TODO)');
                return;
            }

            (runner as any).evalAsync(command, (result: stopify.Result) => {
                if (result.type === 'normal') {
                    this.addNewCommandResult(command, result.value, false);
                }
                else {
                    this.addNewCommandResult(command, result.value, true);
                }
            });
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
            <div className={classes.root}>
                <div style={{ 
                    height: '100%', 
                    flexDirection: 'column', 
                    display: 'flex' }}>
                    <ConsoleOutput logs={this.state.logs as FullMessage[]} />
                    <div style={s1}>
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

                </div>
            </div>
        );
    }
}

export default withStyles(styles)(OutputPanel);