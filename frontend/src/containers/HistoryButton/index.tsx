import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../store';
import Fade from '@material-ui/core/Fade';
import List from '@material-ui/core/List';
import '../../static/styles/Scrollbar.css';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import HistoryIcon from '@material-ui/icons/Storage';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import BubbleIcon from '@material-ui/icons/BubbleChart';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { isFailureResponse } from '../../utils/api/apiHelpers';
import CircularProgress from '@material-ui/core/CircularProgress';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { getSelectedFileName } from '../../store/userFiles/selectors';
import { getFileHistory, FileHistory } from '../../utils/api/getHistory';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';

const styles: StyleRulesCallback = theme => ({
    list: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    listItems: {
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        minHeight: '350px', // subject to change
        minWidth: '400px',
    },
    newDense: {
        paddingBottom: '0px',
    }
});

type StyleClasses =
    | 'list'
    | 'listItems'
    | 'newDense';

type Props = WithStyles<StyleClasses> & {
    fileName: string,
};

type State = {
    tooltipOpen: boolean,
    open: boolean,
    loading: boolean,
    history: FileHistory[]
};

const truncateString = (str: string) => {
    if (str.length > 24) {
        return str.substr(0, 24).replace(/\n/g, '⏎');
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
            history: []
        };
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

    openHistory = () => { this.setState({ open: true }); };

    closeHistory = () => { this.setState({ open: false }); };

    openTooltip = () => { this.setState({ tooltipOpen: true }); };

    closeTooltip = () => { this.setState({ tooltipOpen: false }); };

    render() {
        const { classes } = this.props;
        const { open, tooltipOpen, loading, history } = this.state;
        let content: JSX.Element | JSX.Element[] = <CircularProgress
            size={50}
            style={{ marginTop: '150px', marginLeft: '175px' }}
            color="inherit"

        />
        if (!loading) {
            content = history.map((elem, index) => (
                <ListItem button key={`${index}${index + index - 1}`}>
                    <ListItemIcon>
                        <BubbleIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={`${elem.dateCreated} ${elem.timeCreated}`}
                        secondary={`${truncateString(elem.code)}`}
                    />
                </ListItem>
            ));
        }
        if (!loading && history.length === 0) {
            content = <Typography
                variant="headline"
                align="center"
                color="inherit"
                style={{marginTop: '150px'}}
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
                        <Fade {...TransitionProps} timeout={200}>
                            <Paper>
                                <ClickAwayListener onClickAway={this.closeHistory}>
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
});

export default withStyles(styles)(connect(mapStateToProps)(HistoryButton));