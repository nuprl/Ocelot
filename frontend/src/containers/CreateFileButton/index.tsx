import * as React from 'react';
import DrawerIconButton from 'components/DrawerIconButton';
import AddIcon from '@material-ui/icons/Add';
import { RootState } from 'store';
import { Dispatch, connect } from 'react-redux';
import { createNewFileField } from 'store/userFiles/actions';
import ListItemStyles from 'components/ListItemStyles';
import { ListItemStylesTypes } from 'components/ListItemStyles';
import { WithStyles } from '@material-ui/core';

type CreateFileButtonProps = {
    disabled: boolean,
    onCreateFile: () => void,
};

type Props = CreateFileButtonProps & WithStyles<ListItemStylesTypes>;

const CreateFileButton: React.StatelessComponent<Props>
    = ({ classes, disabled, onCreateFile }) => (
        <DrawerIconButton
            icon={<AddIcon color="inherit" />}
            disabled={disabled}
            title="New File"
            onClick={onCreateFile}
            className={classes.listItemColor}
        />
    );

const CreateFileButtonStyled = ListItemStyles(CreateFileButton);

const mapStateToProps = (state: RootState) => ({
    disabled: state.userFiles.folderInfo.filesLoading
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onCreateFile: () => { dispatch(createNewFileField()); }
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateFileButtonStyled);