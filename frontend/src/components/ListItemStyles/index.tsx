import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';

export type ListItemStylesTypes =
    | 'nested'
    | 'listItemColor'
    | 'listItemSelectedColor'
    | 'textField'
    | 'formControl'
    | 'loadingIcon'
    | 'show'
    | 'codeIcon';

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
        transition: theme.transitions.create('opacity', {
            easing: 'linear',
            duration: theme.transitions.duration.shorter,
        }),
        margin: '5px',
        opacity: 0,
    },
    codeIcon: {
        color: theme.palette.primary.contrastText,
        transition: theme.transitions.create('opacity', {
            easing: 'linear',
            duration: theme.transitions.duration.shorter
        }) + ', ' + theme.transitions.create('visibility', {
            easing: 'linear',
            duration: theme.transitions.duration.shorter
        }),
        visibility: 'hidden',
        opacity: 0,
    },
    show: {
        transition: theme.transitions.create('opacity', {
            easing: 'linear',
            duration: theme.transitions.duration.shorter
        }),
        opacity: 0.8,
        visibility: 'visible'
    },

});

export default withStyles(styles);