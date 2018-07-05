import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';

export type ListItemStylesTypes =
    | 'nested'
    | 'listItemColor'
    | 'listItemSelectedColor'
    | 'textField'
    | 'donut'
    | 'donutDisappear'
    | 'formControl';

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
    donut: {
        width: '0.6em',
        marginRight: '1em',
    },
    donutDisappear: {
        visibility: 'hidden'
    },
    formControl: {
        width: '100%'
    }
});

export default withStyles(styles);