import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CodeIcon from '@material-ui/icons/Code';
import CustomListItemText from '../../../../components/ItemTypography';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemStyles from '../../../../components/ListItemStyles';
import { ListItemStylesTypes } from '../../../../components/ListItemStyles';
import { WithStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Tooltip from '@material-ui/core/Tooltip';
import 'static/styles/DrawerIconButton.css';
import * as state from '../../../../state';
import * as Rx from 'rxjs';
import { saveChanges } from '../../../../utils/api/saveFileChanges';
import { isFailureResponse } from '../../../../utils/api/apiHelpers';

type FileItemProps = {
    fileIndex: number,
    name: string,
    disabled: boolean
};

type Props = FileItemProps & WithStyles<ListItemStylesTypes>;

class FileItem extends React.Component<Props, {selectedIndex: number, dirty: state.Dirty}> {

    private subs: Rx.Subscription[] = [];

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedIndex: state.selectedFileIndex.getValue(),
            dirty: state.dirty.getValue()
        };
    }

    componentDidMount() {
        this.subs.push(
            state.selectedFileIndex.subscribe(x => this.setState({ selectedIndex: x })),
            state.dirty.subscribe(x => this.setState({ dirty: x })));
    }

    componentWillUnmount() {
        for (const sub of this.subs) {
            sub.unsubscribe();
        }
    }

    onDelete() {
        const response = prompt(`Are you sure you want to permanently delete the file '${this.props.name}'? Enter YES to confirm.`);
        if (response !== "YES") {
          state.notification.next({ message: `Delete aborted: ${this.props.name}`, position: 'bottom-right' });
          return;
        }
        saveChanges([{
          fileName: this.props.name,
          type: 'delete',
        }]).then((response) => {
          const { fileIndex } = this.props;
          const oldFiles = state.files.getValue();
          const files = [
            ...oldFiles.slice(0, fileIndex),
            ...oldFiles.slice(fileIndex + 1)];
          const newIndex = fileIndex < files.length ? fileIndex : files.length - 1;
          state.files.next(files);
          state.selectedFileIndex.next(newIndex);
          if (isFailureResponse(response)) {
            console.log('Oh no! File not deleted!');
            state.notification.next({ message: `Unable to delete '${this.props.name}'`, position: 'bottom-right' });
          }
          console.log('File delete!');
          state.notification.next({ message: `File deleted: ${this.props.name}`, position: 'bottom-right' });
        }).catch(error => console.log('cannot delete file', error));
    }

    render() {
        const { classes, name, disabled, fileIndex } = this.props
        const isDisabled = disabled || this.state.dirty !== 'saved';
        const isSelected = fileIndex === this.state.selectedIndex;
        return (
            <ListItem
                button
                disableGutters
                className={`${classes.nested}`}
                classes={{
                    root: `${isSelected && classes.selectedHighlight}`,
                    dense: classes.tinyPadding,
                }}
                onClick={() => {
                    state.selectedFileIndex.next(fileIndex);
                    state.currentProgram.next(state.files.getValue()[fileIndex].content);
                }}
                dense
                disabled={isDisabled}
            >
                <ListItemIcon>
                    <CodeIcon
                        className={`${classes.codeIcon} ${classes.show}`}
                    />
                </ListItemIcon>
                <CustomListItemText
                    text={name}
                    className={classes.listItemColor}
                    styleBody
                />
                < ListItemSecondaryAction className={`fadeIcon ${classes.listItemColor}`} >
                    <Tooltip
                        id="tooltip-icon"
                        title="Delete"
                        disableFocusListener
                        disableTouchListener
                        classes={{
                            tooltipPlacementBottom: classes.closerTooltip
                        }}
                    >
                        <div>  {/* surround the button with a div to suppress the warning even though it's
                                not really necessary*/}
                            <IconButton
                                aria-label="Delete"
                                color="inherit"
                                onClick={() => this.onDelete()}
                                classes={{
                                    root: classes.noButtonBackground
                                }}
                                disabled={isDisabled}
                            >
                                <DeleteIcon color="inherit" />
                            </IconButton>
                        </div>
                    </Tooltip>
                </ListItemSecondaryAction>
            </ListItem>
        );
    }
}

export default ListItemStyles(FileItem);