import * as React from 'react';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

type Props = {
    text: string,
    className: string
}

const CustomListItemText: React.StatelessComponent<Props> = ({ text, className }) => (
    <ListItemText
        disableTypography
        primary={
            <Typography variant="subheading" className={className}>
                {text}
                                </Typography>}
        classes={{ root: className }}
    />
)

export default CustomListItemText;