import * as React from 'react';
import withStyles, { WithStyles, StyleRulesCallback, } from '@material-ui/core/styles/withStyles';
import CustomTheme from './components/CustomTheme';
import * as JumboContent from './JumboContent';
import { detect } from 'detect-browser';
import 'static/styles/JumboContent.css';
import 'static/styles/body.css';
import Typography from '@material-ui/core/Typography';
import * as state from './state';
import { getGithubGist } from './utils/api/getGithubGist';
import { isFailureResponse } from './utils/api/apiHelpers';


const styles: StyleRulesCallback = theme => {
  return {
    root: {
      flexGrow: 1,
      height: '100vh',
      width: '100vw',
      zIndex: 1,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      backgroundColor: theme.palette.primary.main,
    },
    jumboContainer: {
      display: 'flex',
      flexFlow: 'column',
      height: '100%',
    },
    jumboContent: {
      position: 'relative',
      height: '100%',
      flex: '1 1 auto',
    },
    toolbar: {
      ...theme.mixins.toolbar,
      flex: '0 1 auto',
    },
  };
};

type WithStylesClasses =
  | 'root'
  | 'jumboContent'
  | 'toolbar'
  | 'jumboContainer';

class Index extends React.Component<WithStyles<WithStylesClasses>> {

      componentWillMount() {
        const gistParam = (new URLSearchParams(window.location.search)).get('gist');
        if (typeof gistParam === 'string') {
          state.githubGist.next('loading-gist');
        }
      }

      componentDidMount() {
        if (state.githubGist.getValue() === 'loading-gist') {
          state.notify('Loading gist...');
          const gistParam = (new URLSearchParams(window.location.search)).get('gist') as string;
          getGithubGist(gistParam).then((res => {
            if (isFailureResponse(res)) {
              state.notify(res.data.message);
              state.githubGist.next('failed-gist');
              return;
            }
            const gistFileObj = { name: 'gist.js', content: res.data.code };
            state.files.next([ gistFileObj.name]);
            state.loadProgram.next({ kind: "program", ...gistFileObj });
            state.githubGist.next('loaded-gist');
            state.notify('Gist loaded');
          }));
        }


      }

      render() {
        const browser = detect();
        switch (browser && browser.name) {
          case 'chrome':
          case 'firefox':
          case 'safari':
          case 'ios':
            const { classes } = this.props;
            return (<JumboContent.JumboContentDefault classes={classes} />);
          default:
            return (
              <Typography variant="display1" align="center">
                Your browser is unsupported, please use chrome, firefox or safari.
          </Typography>
            );
        }
      }
    }

export default CustomTheme(withStyles(styles)(Index));
