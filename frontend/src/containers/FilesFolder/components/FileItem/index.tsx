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

class  FileItem extends React.Component<Props, {selectedIndex: number}> {

    private subscription: Rx.Subscription | undefined;

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedIndex: state.selectedFileIndex.getValue()
        };
    }

    componentDidMount() {
        this.subscription = state.selectedFileIndex.subscribe(x => this.setState({ selectedIndex: x }));
    }

    componentWillUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onDelete() {
        const response = prompt("Are you sure you want to delete this file? Enter YES or NO");
        if (response !== "YES") {
          state.notification.next({ message: `Delete aborted: ${name}`, position: 'bottom-right' });
          return;
        }
        saveChanges([{
          fileName: name,
          type: 'delete',
        }]).then((response) => {
          if (isFailureResponse(response)) {
            console.log('Oh no! File not deleted!');
          }
          console.log('File delete!');
        }).catch(error => console.log('cannot delete file', error));
    }

    render() {
        const { classes, name, disabled, fileIndex } = this.props
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
                    state.currentProgram.next(state.files.getValue()[fileIndex].content);
                    state.selectedFileIndex.next(fileIndex);
                }}
                dense
                disabled={disabled}
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
                                disabled={disabled}
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