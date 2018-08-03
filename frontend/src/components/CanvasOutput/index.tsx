import * as React from 'react';
import { withStyles, StyleRulesCallback, WithStyles } from '@material-ui/core/styles';
// import defaultImage from '../../static/img/defaultCanvasImage.jpg';
import ReactResizeDetector from 'react-resize-detector';
import 'static/styles/Scrollbar.css';
// import Typography from '@material-ui/core/Typography';

const styles: StyleRulesCallback = theme => ({
    root: {
        background: theme.palette.primary.main,
        width: '100%',
        height: '100%',
    },
    canvasArea: {
        width: '100%',
        // display: 'flex', // this is for empty state
        // flexDirection: 'column',
        // alignItems: 'center', /* Vertical center alignment */
        // justifyContent: 'center', /* Horizontal center alignment */
        height: '100%',
        overflowY: 'auto',
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing.unit * 4,
        right: theme.spacing.unit * 4,
    },
    icon: {
        fontSize: '12em',
        color: theme.palette.primary.contrastText,
        opacity: 0.7,
    }
});

type Props = WithStyles<'icon' | 'root' | 'canvasArea' | 'fab'>;

class CanvasOutput extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }

    componentDidMount() { // temp testing
    }

    onResize = () => {
    };

    render() {
        const { classes } = this.props;
        return (
            <div
                className={classes.root}
            >
                <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
                <div id="canvases" className={`${classes.canvasArea} scrollbars`}>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(CanvasOutput);