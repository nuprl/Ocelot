import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';

export type ListItemStylesTypes =
    | 'nested'
    | 'listItemColor'
    | 'listItemSelectedColor'
    | 'textField'
    | 'formControl'
    | 'loadingIcon';

const styles: StyleRulesCallback<ListItemStylesTypes> = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.80,
    },
    listItemSelectedColor: {
        color: theme.palette.secondary.main,
        opacity: 1,
        // backgroundColor: 'rgba(0, 0, 0, 0.10)', 
        // some way to avoid (without css) making the children text have background color
    },
    textField: {
        color: theme.palette.primary.contrastText,
    },
    formControl: {
        width: '100%'
    },
    loadingIcon: {
        margin: '5px'
    }
});

export default withStyles(styles);