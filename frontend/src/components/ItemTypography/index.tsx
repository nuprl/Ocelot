import * as React from 'react';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

type Props = { text: string, className: string, styleBody?: boolean };

const ItemTypography: React.StatelessComponent<Props> = ({
     text, className, styleBody = false
    }) => (
    <ListItemText
        disableTypography
        primary={
            <Typography variant={styleBody ? 'body1' : 'subheading'} className={className}>
                {text}
            </Typography>}
        classes={{ root: className }}
    />
);

export default ItemTypography;