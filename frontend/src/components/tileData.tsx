import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import StarIcon from '@material-ui/icons/Star';
import SendIcon from '@material-ui/icons/Send';
import MailIcon from '@material-ui/icons/Mail';
import DeleteIcon from '@material-ui/icons/Delete';
import ReportIcon from '@material-ui/icons/Report';
import Typography from '@material-ui/core/Typography';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';

const styles: StyleRulesCallback = theme => ({
  listItemRoot: {
    color: theme.palette.primary.contrastText,
    opacity: 0.85,
  }
});

function mailFolderListItems(props: WithStyles<string>) {
  const mailFolderList = ['Inbox', 'Starred', 'Send mail', 'Drafts'];
  const mailFolderIcons = [<InboxIcon key={1} className={props.classes.listItemRoot} />,
  <StarIcon key={2} />, <SendIcon key={3} />, <DraftsIcon key={4} />];
  return (
    <div>
      {[0, 1, 2, 3].map(value => (
        <ListItem button>
          <ListItemIcon>
            {mailFolderIcons[value]}
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={
              <Typography variant="subheading" style={{ color: '#ffffff' }}>
                {mailFolderList[value]}
              </Typography>}
            classes={{ root: props.classes.listItemRoot }} 
          />
        </ListItem>
      ))}
    </div>
  );
}

const result = withStyles(styles)(mailFolderListItems);
export const MailFolderListItems = result;

export const otherMailFolderListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <MailIcon />
      </ListItemIcon>
      <ListItemText primary="All mail" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText primary="Trash" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <ReportIcon />
      </ListItemIcon>
      <ListItemText primary="Spam" />
    </ListItem>
  </div>
);