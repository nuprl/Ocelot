import * as React from 'react';
import Typography from '@material-ui/core/Typography';

const style: React.CSSProperties = {
    backgroundColor: '#eee',
    textAlign: 'center',
    color: 'grey',
    height: '100%',
    width: '100%'
};

const CanvasOutput: React.StatelessComponent = () => (
    <div
        style={style}
    >
        <Typography
            variant="display3"
            color="inherit"
            style={{ lineHeight: '200px' }}
        >
            [Insert Canvas here]
        </Typography>
    </div>
);

export default CanvasOutput;