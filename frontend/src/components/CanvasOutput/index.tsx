import * as React from 'react';
import { withStyles, StyleRulesCallback, WithStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import defaultImage from 'static/img/defaultCanvasImage.jpg';
import ReactResizeDetector from 'react-resize-detector';
import 'static/styles/Scrollbar.css';
// import Typography from '@material-ui/core/Typography';
import UploadIcon from '@material-ui/icons/FileUpload';
import Button from '@material-ui/core/Button';
import GetUrlDialog from 'components/GetUrlDialog';
import Zoom from '@material-ui/core/Zoom';

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
        height: 'calc(100% - 48px)',
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

type State = {
    tabIndex: number,
    uploadDialogOpen: boolean
};

type Props = WithStyles<'icon' | 'root' | 'canvasArea' | 'fab'>;

class CanvasOutput extends React.Component<Props, State> {
    inputCanvas: HTMLCanvasElement | null = null;
    outputCanvas: HTMLCanvasElement | null = null;
    constructor(props: Props) {
        super(props);
        this.state = {
            tabIndex: 0,
            uploadDialogOpen: false,
        };
    }

    onTabChange = (event: React.ChangeEvent<{}>, value: number) => {
        this.setState({ tabIndex: value });
    };

    componentDidMount() { // temp testing
        this.inputCanvas = document.getElementById('inputCanvas') as HTMLCanvasElement;
        this.outputCanvas = document.getElementById('outputCanvas') as HTMLCanvasElement;
        this.loadImageToCanvas(defaultImage);
    }

    openDialog = () => {
        this.setState({ uploadDialogOpen: true });
    };

    onResize = () => {
        if (this.inputCanvas === null || this.outputCanvas === null) {
            return;
        }
        this.inputCanvas.style.width = '100%';
        this.outputCanvas.style.width = '100%';
    };

    closeDialog = () => {
        this.setState({ uploadDialogOpen: false });
    };

    loadImageToCanvas = (url: string) => {
        let img = new Image;
        img.onload = () => {
            if (this.inputCanvas === null || this.outputCanvas === null) {
                return;
            }
            // tslint:disable-next-line:no-console
            console.log('Loaded!');
            this.inputCanvas.height = img.naturalHeight;
            this.inputCanvas.width = img.naturalWidth;
            this.outputCanvas.height = img.naturalHeight;
            this.outputCanvas.width = img.naturalWidth;
            (this.inputCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(img, 0, 0);
        };
        img.onerror = (a) => {
            // tslint:disable-next-line:no-console
            console.error('Error! image', a);
        };
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = url + '?' + new Date().getTime();
    };

    render() {
        const { classes } = this.props;
        const { tabIndex, uploadDialogOpen } = this.state;
        return (
            <div
                className={classes.root}
            >
                <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
                <AppBar position="static">
                    <Tabs value={tabIndex} onChange={this.onTabChange}>
                        <Tab label="Input" />
                        <Tab label="Output" />
                    </Tabs>
                </AppBar>
                <div className={`${classes.canvasArea} scrollbars`}>
                    <canvas
                        id="inputCanvas"
                        height="400"
                        width="600"
                        style={tabIndex === 0 ? {} : { display: 'none' }}
                    />
                    <canvas
                        id="outputCanvas"
                        height="400"
                        width="600"
                        style={tabIndex === 1 ? {} : { display: 'none' }}
                    />
                    <Zoom in={tabIndex === 0} unmountOnExit>
                        <Button
                            variant="fab"
                            color="secondary"
                            aria-label="Upload"
                            className={classes.fab}
                            onClick={this.openDialog}
                        >
                            <UploadIcon />
                        </Button>
                    </Zoom>
                    {/* <UploadIcon className={classes.icon} />
                    <Typography variant="display1" align="center" style={{ paddingBottom: '0.5em' }}>
                        Upload an image to canvas
                    </Typography>
                    <Button color="secondary" variant="outlined" size="large" onClick={this.openDialog}>
                        Upload
                    </Button> */}
                    <GetUrlDialog open={uploadDialogOpen} onClose={this.closeDialog} hasUrl={this.loadImageToCanvas} />
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(CanvasOutput);