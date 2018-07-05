import * as React from 'react';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import 'static/styles/DrawerIconButton.css';

interface DrawerIconButtonProps {
    onClick: () => void;
    disabled?: boolean;
    icon: React.ReactElement<SvgIconProps>;
    title: string;
    className: string;
}

type Props = DrawerIconButtonProps;

const DrawerIconButton: React.StatelessComponent<Props> = ({
    onClick,
    disabled = false,
    icon,
    title,
    className
}) => (
        < ListItemSecondaryAction className={`fadeIcon ${className}`} >
            <Tooltip id="tooltip-icon" title={title} disableHoverListener={disabled}>
                <div>  {/* surround the button with a div to suppress the warning even though it's
                            not really necessary*/}
                    <IconButton
                        aria-label={title}
                        color="inherit"
                        disabled={disabled}
                        onClick={onClick}
                    >
                        {icon}
                    </IconButton>
                </div>
            </Tooltip>
        </ListItemSecondaryAction>
    );

export default DrawerIconButton;