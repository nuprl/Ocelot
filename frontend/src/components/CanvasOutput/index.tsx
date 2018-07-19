import * as React from 'react';
import { withStyles, StyleRulesCallback, WithStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import imageSrc from 'static/img/image.jpg';

const styles: StyleRulesCallback = theme => ({
    root: {
        background: theme.palette.background.paper,
        width: '100%',
        height: '100%',
    }
});

type State = {
    tabIndex: number,
};

interface NewWindow extends Window {
    getImageFromCanvas: (canvasId: string) => undefined | ImageData;
    setImageToCanvas: (canvasId: string, image: ImageData) => void;
    setPixelToImage: (image: ImageData, x: number, y: number, color: [number, number, number]) => void;
    getPixelFromImage: (image: ImageData, x: number, y: number) => [number, number, number];
}

class CanvasOutput extends React.Component<WithStyles<'root' | 'fillSpace'>, State> {
    constructor(props: WithStyles<'root' | 'fillSpace'>) {
        super(props);
        this.state = {
            tabIndex: 0,
        };
    }

    onTabChange = (event: React.ChangeEvent<{}>, value: number) => {
        this.setState({ tabIndex: value });
    };

    componentDidMount() { // temp testing
        const inputCanvas = document.getElementById('inputCanvas') as HTMLCanvasElement;
        // const outputCanvas = document.getElementById('outputCanvas') as HTMLCanvasElement;
        let img = new Image;
        img.onload = () => {
            (inputCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(img, 0, 0);
        };
        img.src = imageSrc;

        const getCanvasContext
            = (canvasId: string): Partial<{ canvas: HTMLCanvasElement, context: CanvasRenderingContext2D }> => {
                const canvas = (document.getElementById(canvasId) as HTMLCanvasElement);
                if (canvas === null) {
                    return {};
                }
                return { canvas: canvas, context: (canvas.getContext('2d') as CanvasRenderingContext2D) };
            };

        (window as NewWindow).getImageFromCanvas = (canvasId) => {
            const { canvas, context } = getCanvasContext(canvasId);
            if (canvas === undefined || context === undefined) {
                return undefined;
            }
            const width = canvas.width;
            const height = canvas.height;
            return context.getImageData(0, 0, width, height);
        };

        (window as NewWindow).setImageToCanvas = (canvasId, image) => {
            const { context } = getCanvasContext(canvasId);
            if (context === undefined) {
                return;
            }
            context.putImageData(image, 0, 0);
        };

        (window as NewWindow).setPixelToImage = (image, x, y, color) => {
            const index = 4 * (y * image.width + x);
            image.data[index] = color[0];
            image.data[index + 1] = color[1];
            image.data[index + 2] = color[2];
            image.data[index + 3] = 255;
        };

        (window as NewWindow).getPixelFromImage = (image, x, y) => {
            const index = 4 * (y * image.width + x);
            return [
                image.data[index],
                image.data[index + 1],
                image.data[index + 2]
            ];
        };

    }

    render() {
        const { classes } = this.props;
        const { tabIndex } = this.state;
        return (
            <div
                className={classes.root}
            >
                <AppBar position="static">
                    <Tabs value={tabIndex} onChange={this.onTabChange}>
                        <Tab label="Input" />
                        <Tab label="Output" />
                    </Tabs>
                </AppBar>
                <canvas
                    id="inputCanvas"
                    height="400" // hard coding dimensions for now
                    width="600"
                    style={tabIndex === 0 ? {} : { display: 'none' }}
                />
                <canvas
                    id="outputCanvas"
                    height="400"
                    width="600"
                    style={tabIndex === 1 ? {} : { display: 'none' }}
                />

            </div>
        );
    }
}

export default withStyles(styles)(CanvasOutput);