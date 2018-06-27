import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import Hidden from '@material-ui/core/Hidden';

const styles: StyleRulesCallback = theme => ({
    emailText: {
        paddingRight: theme.spacing.unit,
    }
});

type EmailTextProps = {
    show: boolean,
    email: string,
};

function EmailText(props: WithStyles<'emailText'> & EmailTextProps) {
    const { classes, show, email } = props;
    return (
        <Hidden xsDown>
            <Fade in={show} {...(show ? { timeout: 500 } : {})}>
                <div
                    className={classes.emailText}
                    style={{ display: (show ? 'inline-block' : 'none') }}
                >
                    <Typography variant="subheading" color="inherit">
                        {email}
                    </Typography>
                </div>
            </Fade>
        </Hidden>
    );
}

export default withStyles(styles)(EmailText);