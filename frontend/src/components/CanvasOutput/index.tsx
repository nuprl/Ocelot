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