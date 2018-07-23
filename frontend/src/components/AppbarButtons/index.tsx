import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import LayoutIcon from '@material-ui/icons/ViewQuilt';
import Tooltip from '@material-ui/core/Tooltip';

const AppbarButtons: React.StatelessComponent = () => (
    <div>
        <Tooltip title="Layout">
            <IconButton color="inherit" aria-label="Layout">
                <LayoutIcon />
            </IconButton>
        </Tooltip>
        <div style={{ display: 'inline-block', width: '0.5em' }} />
    </div>
);

export default AppbarButtons;