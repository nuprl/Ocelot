import * as React from 'react';
import Fade from '@material-ui/core/Fade';
import List from '@material-ui/core/List';
import '../../static/styles/Scrollbar.css';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import HistoryIcon from '@material-ui/icons/History';
import Typography from '@material-ui/core/Typography';
import BubbleIcon from '@material-ui/icons/BubbleChart';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { isFailureResponse } from '../../utils/api/apiHelpers';
import CircularProgress from '@material-ui/core/CircularProgress';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { getFileHistory, FileHistory } from '../../utils/api/getHistory';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import { MonacoDiffEditor } from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import { saveHistory } from '../../utils/api/saveHistory';
import * as state from '../../state';
import { connect } from '../../reactrx';
import { console } from '../../errors';

const styles: StyleRulesCallback = theme => ({
    list: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.primary.main,
    },
    listItems: {
        overflowY: 'auto',
        height: '324px', // subject to change
        width: '400px',
    },
    newDense: {
        paddingBottom: '0px',
    },
    secondaryText: {
        fontFamily: '\'Fira Mono\', monospace',
    },
    sameCode: {
        backgroundColor: theme.palette.secondary.dark + '9e',
    }
});

type StyleClasses =
    | 'list'
    | 'listItems'
    | 'newDense'
    | 'secondaryText'
    | 'sameCode';

const monacoOptions: monacoEditor.editor.IDiffEditorConstructionOptions = {
    wordWrap: 'on',
    overviewRulerLanes: 0,
    glyphMargin: false,
    lineNumbers: 'off',
    folding: false,
    selectOnLineNumbers: false,
    // cursorStyle: 'line-thin',
    scrollbar: {
        useShadows: false,
        horizontal: 'hidden',
        verticalScrollbarSize: 9,
    },
    minimap: {
        enabled: false,
    },
    contextmenu: false,
    readOnly: true,
    fontFamily: 'Fira Mono',
    fontSize: 10,
    renderSideBySide: false
};

type Props = WithStyles<StyleClasses>;

type State = {
    loggedIn: boolean,
    open: boolean,
    loading: boolean,
    history: FileHistory[],
    codeOpenIndex: number,
    currentProgram: state.Program
};

const truncateString = (str: string) => {
    if (str.length > 25) {
        return str.substr(0, 25).replace(/\n/g, '⏎') + '...';
    }
    return str.replace(/\n/g, '⏎');
};

class HistoryButton extends React.Component<Props, State> {
    anchorEl: any;
    constructor(props: Props) {
        super(props);
        this.state = {
            open: false,
            loggedIn: false,
            loading: false,
            history: [],
            codeOpenIndex: -1,
            currentProgram: state.currentProgram.getValue()
        };
        connect(this, 'loggedIn', state.uiActive);
        connect(this, 'currentProgram', state.currentProgram);
    }

    onClick = () => {
        this.openHistory();
        this.setState({ loading: true });
        getFileHistory(state.currentFileName()).then(response => {
            this.setState({ loading: false, history: [] });
            if (isFailureResponse(response)) {
                // tslint:disable-next-line:no-console
                console.log(response.data.message);
                // probably a notification.
                return;
            }
            this.setState({ history: response.data.history });
        }).catch(err => {
            // tslint:disable-next-line:no-console
            console.log(err);
        });
    };

    onClickAway = () => { this.setState({ open: false, codeOpenIndex: -1 }); };

    openHistory = () => { this.setState({ open: true }); };

    toggleCode = (index: number) => {
        if (this.state.codeOpenIndex === index) {
            this.setState({ codeOpenIndex: -1 });
            return;
        }
        this.setState({ codeOpenIndex: index });
    };

    onRestore = (index: number, generation: number) => {
        return () => {
            this.setState({ open: false, codeOpenIndex: -1 });
            saveHistory(state.currentFileName(), this.state.history[index].code, generation)
            // TODO(arjun): I suggest we not do this
            setTimeout(() => { // immediate state change causes the UI to update immediately
                if (this.state.currentProgram.kind !== 'program') {
                    return;
                }
                // The UI looks 'buggy' if I were to not setTimeout
                const editor = state.currentProgram.getValue();
                const { history } = this.state;
                if (editor === undefined || history.length - 1 < index) {
                    return;
                }
                state.loadProgram.next({
                    kind: 'program',
                    name: this.state.currentProgram.name,
                    content: this.state.history[index].code
                });
            }, 30);
        };
    }

    render() {
        if (!this.state.loggedIn) {
            return null;
        }
        const { classes } = this.props;
        const { open, loading, history, codeOpenIndex, currentProgram } = this.state;
        let content: JSX.Element | JSX.Element[] = <CircularProgress
            size={50}
            style={{ marginTop: '125px', marginLeft: '175px' }}
            color="inherit"

        />
        if (!loading && currentProgram.kind === 'program') {
            content = history.map((elem, index) => (
                <div
                    key={`${elem.timeCreated}${index}`}
                    className={currentProgram.content === elem.code ? `${classes.sameCode}` : ''}
                >
                    <ListItem button onClick={() => this.toggleCode(index)}>
                        <ListItemIcon>
                            <BubbleIcon />
                        </ListItemIcon>
                        <ListItemText
                            classes={{
                                secondary: classes.secondaryText
                            }}
                            primary={`${elem.dateCreated} ${elem.timeCreated}`}
                            secondary={`${truncateString(elem.code)}`} // best to not show when clicked
                        />
                    </ListItem>
                    <Collapse in={codeOpenIndex === index} timeout="auto" unmountOnExit>
                        <List  dense>
                            <ListItem>
                                <div style={{ height: '100%', width: '100%' }}>
                                    <MonacoDiffEditor
                                        language="elementaryjs"
                                        height={210}
                                        original={currentProgram.content}
                                        value={elem.code}
                                        options={monacoOptions}
                                    />
                                    {
                                        currentProgram.content !== elem.code &&
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            fullWidth
                                            style={{ marginTop: '1em', alignSelf: 'right' }}
                                            onClick={this.onRestore(index, elem.generation)}

                                        >
                                            Restore
                                        </Button>
                                    }
                                </div>
                            </ListItem>
                        </List>
                    </Collapse>
                </div>
            ));
        }
        if (!loading && history.length === 0) {
            content = <Typography
                variant="headline"
                align="center"
                color="inherit"
                style={{ marginTop: '150px' }}
            >
                No history saved
            </Typography>
        }
        return (
            <div>
                <Button
                        disabled={currentProgram.kind !== 'program'}
                        color="secondary"
                        onClick={this.onClick}>
                    <HistoryIcon />
                    <span id="toolbar-buttons-text">History</span>
                </Button>
                <Popper
                    open={open}
                    placement="bottom-end"
                    anchorEl={this.anchorEl}
                    disablePortal={true}
                    modifiers={{
                        flip: {
                            enabled: true,
                        },
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: 'scrollParent',
                        },
                    }}
                    transition
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={150}>
                            <Paper>
                                <ClickAwayListener onClickAway={this.onClickAway}>
                                    <div className={classes.list}>
                                        <List
                                            dense
                                            classes={{
                                                dense: classes.newDense
                                            }}
                                        >
                                            <div className={`${classes.listItems} scrollbars`}>
                                                {content}
                                            </div>
                                        </List>
                                    </div>
                                </ClickAwayListener>
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </div>
        );
    }
}

export default withStyles(styles)(HistoryButton);