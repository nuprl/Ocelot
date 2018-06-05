import * as React from 'react';
import List from '@material-ui/core/List';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import StarBorder from '@material-ui/icons/StarBorder';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const styles: StyleRulesCallback = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
});

type Props = {
    files?: [{ name: string, content: string }]
};

type State = {
    open: boolean
};

class FilesFolderList extends React.Component<WithStyles<string> & Props, State> {
    constructor(props: WithStyles<string> & Props) {
        super(props);
        this.state = {
            open: false,
        };
    }

    handleClick = () => {
        this.setState({open: !this.state.open});
    };

    render() {
        const { classes } = this.props;
        const { open } = this.state;

        return (
            <div>
                <ListItem button onClick={this.handleClick}>
                    <ListItemIcon>
                        <InboxIcon />
                    </ListItemIcon>
                    <ListItemText inset primary="Inbox" />
                    {this.state.open ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem button className={classes.nested}>
                            <ListItemIcon>
                                <StarBorder />
                            </ListItemIcon>
                            <ListItemText inset primary="Starred" />
                        </ListItem>
                    </List>
                </Collapse>
            </div>
        );
    }
}

export default withStyles(styles)(FilesFolderList);