import * as React from 'react';
import { withStyles, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import DrawerIconButton from 'components/DrawerIconButton';
import AddIcon from '@material-ui/icons/Add';
import { RootState } from 'store';
import { Dispatch, connect } from 'react-redux';
import { createNewFileField } from 'store/userFiles/actions';

const styles: StyleRulesCallback = theme => ({
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.80,
    }
})

type CreateFileButtonProps = {
    disabled: boolean,
    onCreateFile: () => void,
}

type Props = CreateFileButtonProps & WithStyles<'listItemColor'>;

const CreateFileButton: React.StatelessComponent<Props>
    = ({ classes, disabled, onCreateFile }) => (
        <DrawerIconButton
            icon={<AddIcon color="inherit" />}
            disabled={disabled}
            title="New File"
            onClick={onCreateFile}
            className={classes.listItemColor}
        />
    )

const CreateFileButtonStyled = withStyles(styles)(CreateFileButton);

const mapStateToProps = (state: RootState) => ({
    disabled: state.userFiles.folderInfo.filesLoading
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onCreateFile: () => { dispatch(createNewFileField()); }
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateFileButtonStyled);