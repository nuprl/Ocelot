import * as React from 'react';
import UserLogin from '../../containers/UserLogin';
import TitledAppbar from './components/TitledAppbar';
import IconButton from '@material-ui/core/IconButton';
import LayoutIcon from '@material-ui/icons/ViewQuilt';
import Tooltip from '@material-ui/core/Tooltip';
import HistoryButton from '../../containers/HistoryButton';

type MenuAppbarProps = {
    title: string,
};

export default function MenuAppbar(props: MenuAppbarProps) {
    return (
        <TitledAppbar title={props.title}>
            <HistoryButton />
            {/* Will be its own component later */}
            <Tooltip title="Layout"> 
                <IconButton color="inherit" aria-label="Layout">
                    <LayoutIcon />
                </IconButton>
            </Tooltip>
            <div style={{ display: 'inline-block', width: '0.5em' }} />
            <UserLogin />
        </TitledAppbar>
    );
}