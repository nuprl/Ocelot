import { withStyles, StyleRulesCallback } from '@material-ui/core/styles';

export type ListItemStylesTypes =
    | 'nested'
    | 'listItemColor'
    | 'selectedHighlight'
    | 'textField'
    | 'formControl'
    | 'loadingIcon'
    | 'show'
    | 'codeIcon'
    | 'tinyPadding'
    | 'noButtonBackground'
    | 'closerTooltip';

const styles: StyleRulesCallback<ListItemStylesTypes> = theme => ({
    nested: {
        paddingLeft: theme.spacing.unit * 4
    },
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.9,
    },
    selectedHighlight: {
        backgroundColor: `${theme.palette.secondary.main}77`,
        '&:hover': {
            backgroundColor: `${theme.palette.secondary.main}77`,
        }
    },
    textField: {
        color: theme.palette.primary.contrastText,
        fontSize: 14
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
    tinyPadding: {
        paddingTop: '3px',
        paddingBottom: '3px'
    },
    noButtonBackground: {
        '&:hover':{
            backgroundColor: '#ffffff00'
        }
    },
    closerTooltip: {
        margin: '0 0'
    }

});

export default withStyles(styles);