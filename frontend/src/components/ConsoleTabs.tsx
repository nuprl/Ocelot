import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import ConsoleScreen from './ConsoleScreen';
import 'static/styles/ConsoleTabs.css';

function EmptyDiv() {
  return (
    <div style={{ flex: 1 }} />
  );
}

type CloseButtonProps = {
  classes: Record<string, string>,
  consoleDown: boolean,
  toggleConsole: () => void;
};

function CloseButton(props: CloseButtonProps) {
  return (
    <IconButton
      aria-label="delete"
      color="inherit"
      className={`${props.classes.iconButton} ${props.consoleDown ? '' : props.classes.iconButtonPressed}`}
      onClick={props.toggleConsole}
    >
      <ExpandMore color="inherit" />
    </IconButton>
  );
}

const styles: StyleRulesCallback = theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.primary.light,
    height: '100%'
  },
  iconButton: {
    marginRight: theme.spacing.unit,
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.short,
    }),
    transform: 'rotate(0)',
  },
  iconButtonPressed: {
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.short,
    }),
    transform: 'rotate(180deg)',
  },
});

type State = {
  index: number,
  consoleDown: boolean,
};

class ConsoleTabs extends React.Component<WithStyles<string>, State> {

  constructor(props: WithStyles<string>) {
    super(props);
    this.state = {
      index: 0,
      consoleDown: false,
    };
  }

  handleChange = (event: React.ChangeEvent<{}>, value: number) => {
    this.setState({ index: value });
  };

  toggleConsole = () => {
    this.setState((prevState: State) => {
      return { consoleDown: !prevState.consoleDown };
    });
  };

  render() {
    const { classes } = this.props;
    const { index, consoleDown } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static" id="tabs">
          <Tabs value={index} onChange={this.handleChange}>
            <Tab label="Console" />
            {/* <Tab label="Tests" /> */}
            <EmptyDiv />
            <CloseButton classes={classes} consoleDown={consoleDown} toggleConsole={this.toggleConsole} />
          </Tabs>
        </AppBar>
        {index === 0 && <ConsoleScreen />}
        {/* {index === 1 && <TabContainer>Tests</TabContainer>} */}
      </div>
    );
  }
}

export default withStyles(styles)(ConsoleTabs);