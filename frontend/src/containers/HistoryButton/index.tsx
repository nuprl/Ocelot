import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../store';
import Fade from '@material-ui/core/Fade';
import List from '@material-ui/core/List';
import '../../static/styles/Scrollbar.css';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Popper from '@material-ui/core/Popper';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import HistoryIcon from '@material-ui/icons/Storage';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import BubbleIcon from '@material-ui/icons/BubbleChart';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { isFailureResponse } from '../../utils/api/apiHelpers';
import CircularProgress from '@material-ui/core/CircularProgress';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { getSelectedFileName, getSelectedCode } from '../../store/userFiles/selectors';
import { getFileHistory, FileHistory } from '../../utils/api/getHistory';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import { MonacoDiffEditor } from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor';
import { saveHistory } from '../../utils/api/saveHistory';

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

type Props = WithStyles<StyleClasses> & {
    fileName: string,
    loggedIn: boolean,
    code: string,
    editor: monacoEditor.editor.IStandaloneCodeEditor | undefined
};

type State = {
    tooltipOpen: boolean,
    open: boolean,
    loading: boolean,
    history: FileHistory[],
    codeOpenIndex: number,
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
            tooltipOpen: false,
            open: false,
            loading: false,
            history: [],
            codeOpenIndex: -1,
        };
    }

    shouldComponentUpdate(prevProps: Props) {
        // this is not recommended, preventing component updates
        // but I can't figure out how to prevent/delay the component
        // from updating when the user selects a different file while
        // the history list is still opened.
        if (prevProps.code !== this.props.code) {
            return false;
        }
        return true;
    }

    onClick = () => {
        this.openHistory();
        this.setState({ loading: true });
        getFileHistory(this.props.fileName).then(response => {
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

    openTooltip = () => { this.setState({ tooltipOpen: true }); };

    closeTooltip = () => { this.setState({ tooltipOpen: false }); };

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
            saveHistory(this.props.fileName, this.state.history[index].code, generation)
                .then(() => {
                    console.log('Saved!');
                }).catch((err) => {
                    console.log('not saved', err);
                });
            setTimeout(() => { // immediate state change causes the UI to update immediately
                // The UI looks 'buggy' if I were to not setTimeout
                const { editor } = this.props;
                const { history } = this.state;
                if (editor === undefined || history.length - 1 < index) {
                    return;
                }
                const numLines = editor.getModel().getLineCount();
                const finalColumn = editor.getModel().getLineMaxColumn(numLines);
                editor.executeEdits(
                    'restore_from_revision', // just a made up name
                    [{
                        range: new monacoEditor.Range(
                            1,
                            1,
                            numLines,
                            finalColumn
                        ),
                        text: this.state.history[index].code,
                        forceMoveMarkers: true
                    }]
                );
            }, 30);
        };
    }

    render() {
        if (!this.props.loggedIn) {
            return null;
        }
        const { classes, code } = this.props;
        const { open, tooltipOpen, loading, history, codeOpenIndex } = this.state;
        let content: JSX.Element | JSX.Element[] = <CircularProgress
            size={50}
            style={{ marginTop: '125px', marginLeft: '175px' }}
            color="inherit"

        />
        history.map((elem) => {
            const dateTime = new Date(
                elem.dateCreated + " " + elem.timeCreated + " UTC");
            elem.dateCreated = dateTime.toLocaleDateString('en-US');
            elem.timeCreated = dateTime.toLocaleTimeString('en-US');
        });
        if (!loading) {
            content = history.map((elem, index) => (
                <div
                    key={`${elem.timeCreated}${index}`}
                    className={code === elem.code ? `${classes.sameCode}` : ''}
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
                        <List component="div" dense>
                            <ListItem>
                                <div style={{ height: '100%', width: '100%' }}>
                                    <MonacoDiffEditor
                                        language="elementaryjs"
                                        height={210}
                                        original={this.props.code}
                                        value={elem.code}
                                        options={monacoOptions}
                                    />
                                    {
                                        code !== elem.code &&
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
                No history saved :)
            </Typography>
        }
        return (
            <div>
                <Tooltip
                    title="History"
                    onOpen={this.openTooltip}
                    onClose={this.closeTooltip}
                    open={!open && tooltipOpen}
                >
                    <IconButton
                        color="inherit"
                        aria-label="Layout"
                        buttonRef={node => {
                            this.anchorEl = node;
                        }}
                        onClick={this.onClick}
                    >
                        <HistoryIcon />
                    </IconButton>
                </Tooltip>
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
                                            subheader={
                                                <ListSubheader component="div">History</ListSubheader>
                                            }
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

const mapStateToProps = (state: RootState) => ({
    fileName: getSelectedFileName(state),
    loggedIn: state.userLogin.loggedIn,
    code: getSelectedCode(state),
    editor: state.codeEditor.monacoEditor
});

export default withStyles(styles)(connect(mapStateToProps)(HistoryButton));