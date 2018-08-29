import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import 'static/styles/ConsoleTabs.css';
import { Message } from 'console-feed/lib/definitions/Console';
import { Message as FullMessage } from 'console-feed/lib/definitions/Component';
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import RightArrowIcon from '@material-ui/icons/KeyboardArrowRight';

import { Console } from 'console-feed';
import { inspectorTheme } from './static/styles/consoleStyle';
import 'static/styles/Scrollbar.css';
import { Sandbox } from './sandbox';

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
                    flexGrow: 1
                }}
                ref={(divElem) => this.logRef = divElem}>
                <Console logs={logs} variant="dark" styles={inspectorTheme} />
            </div>
        );
    }

}

const lineHeight = 22; // pixels
const maxHeight = 126;

const monacoOptions: monacoEditor.editor.IEditorConstructionOptions = {
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
    sandbox: Sandbox,
    aref: (panel: OutputPanel) => void,
    openMustLogin: () => void,
}

type State = {
    logs: Message[],
    editorHeight: number,
    commandHistory: string[];
    historyLocation: number,
};

class OutputPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            logs: [],
            commandHistory: [],
            historyLocation: -1, // keep track of where in history one is in
            editorHeight: lineHeight,
        };
    }

    error(message: string) {
        this.appendLogMessage({
            method: 'log',
           data: [
             `%c${message}`,
            'color: #ff0000; font-weight: bold'
           ]
        });
    }

    log(...message: any[]) {
        this.appendLogMessage({ method: 'log', data: message });
    }

    /** Appends a message to the log. Bounds scrollback to 100 items. */
    appendLogMessage(message: Message | { method: 'command' | 'result' | 'error', data: any }) {
        this.setState((prevState) => {
            let newLog = [...prevState.logs, message as Message];
            if (newLog.length > 100) {
                newLog = newLog.slice(newLog.length - 100);
            }
            return { logs: newLog };
        });
    }

    componentDidMount() {
        this.props.sandbox.setConsole(this);
        this.props.aref(this);
    }

    echo(command: string) {
        this.appendLogMessage({ method: 'command', data: [command] });
    }

    command = (command: string, result: any, isError: boolean) => {
        this.appendLogMessage({ method: 'command', data: [command] });
        if (isError) {
            this.error(result);
        }
        else {
            this.log(result);
        }
    };

    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined = undefined;

    editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
        window.addEventListener('resize', this.resizeEditor);
        let currentLineCount = 1;
        editor.onDidChangeModelContent(() => { // when code changes
            const totalLineCount = editor.getModel().getLineCount();
            if (totalLineCount !== currentLineCount) {
                this.setState({
                    editorHeight: Math.min(maxHeight, totalLineCount * lineHeight)
                });
                editor.layout();
                currentLineCount = totalLineCount;
            }
        });

        const retrieveHistory = (event: monacoEditor.IKeyboardEvent, isDownkey: boolean) => {
            event.preventDefault();
            event.stopPropagation();
            if (!isDownkey && this.state.historyLocation + 1 > this.state.commandHistory.length - 1) { // if at the top of history
                return;
            }
            let newHistoryLocation = Math.min(this.state.historyLocation + 1, this.state.commandHistory.length - 1);
            if (isDownkey) {
                newHistoryLocation = Math.max(this.state.historyLocation - 1, -1);
            }
            editor.setValue(this.state.commandHistory[newHistoryLocation] || '');
            const newLineCount = editor.getModel().getLineCount();
            const newColumn = editor.getModel().getLineMaxColumn(newLineCount)
            editor.setPosition({ lineNumber: newLineCount, column: newColumn });
            this.setState({ historyLocation: newHistoryLocation });

        };

        editor.onKeyDown(event => {
            const currentCursorLineNum = editor.getPosition().lineNumber;
            const totalNumLines = editor.getModel().getLineCount();
            if (event.keyCode === monaco.KeyCode.UpArrow && currentCursorLineNum === 1) { // if topmost line
                retrieveHistory(event, false);
                return;
            }
            if (event.keyCode === monaco.KeyCode.DownArrow && currentCursorLineNum === totalNumLines) { // if last line
                retrieveHistory(event, true);
                return;
            }
            if (event.keyCode === monaco.KeyCode.Enter && event.shiftKey) {
                return;
            }
            if (event.keyCode === monaco.KeyCode.Enter && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                const command = editor.getValue();
                if (command.trim() === '') {
                    return;
                }
                editor.setValue('');
                this.setState({
                    historyLocation: -1,
                    commandHistory: [command, ...this.state.commandHistory]
                });
                this.props.sandbox.onConsoleInput(command);
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
        const { classes,  } = this.props;
        return (
            <div className={classes.root} id="outputPanel">
                <div style={{
                    height: '100%',
                    flexDirection: 'column',
                    display: 'flex'
                }}>
                    <ConsoleOutput logs={this.state.logs as FullMessage[]} />
                    <div style={s1}>
                        <div style={{ color: 'white', height: '24px' }}>
                            <RightArrowIcon color="inherit" />
                        </div>
                        <div style={{ verticalAlign: 'middle', width: '100%', height: `${this.state.editorHeight}px` }}>
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