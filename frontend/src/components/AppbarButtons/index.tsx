import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import RunIcon from '@material-ui/icons/PlayArrow';
import LayoutIcon from '@material-ui/icons/ViewQuilt';
import Tooltip from '@material-ui/core/Tooltip';

const AppbarButtons: React.StatelessComponent = () => (
    <div>
        <Tooltip title="Run">
            <IconButton color="inherit" aria-label="Run">
                <RunIcon />
            </IconButton>
        </Tooltip>
        <Tooltip title="Layout">
            <IconButton color="inherit" aria-label="Layout">
                <LayoutIcon />
            </IconButton>
        </Tooltip>
        <div style={{ display: 'inline-block', width: '0.5em' }} />
    </div>
);

export default AppbarButtons;