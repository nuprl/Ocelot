import * as React from 'react';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import FileItem from '../FileItem';

const styles: StyleRulesCallback = theme => ({
    
    listItemColor: {
        color: theme.palette.primary.contrastText,
        opacity: 0.80,
    },
    textField: {
        color: theme.palette.primary.contrastText,
    },
    formControl: {
        width: '100%'
    }
});

type Props = {
    files: { name: string, content: string }[],
    selectedFileIndex: number,
    makeHandleClickFile: (index: number) => () => void,
    makeHandleDeleteFile: (index: number) => () => void,
    onCreatedFile: (fileName: string) => void,
    newFile: boolean,
    onNoNewFile: () => void,
    fileSaved: boolean[]
};

class UserFiles extends React.Component<WithStyles<string> & Props> {

    componentDidUpdate() {
        var filenameInput = document.getElementById('filename-input');
        if (filenameInput === null) {
            return;
        }
        filenameInput.addEventListener('keyup', (event) => {
            if (event.keyCode !== 13 || event.target === null) {
                return;
            }
            const name = (event.target as HTMLTextAreaElement).value;
            const result = this.props.files.filter((elem) => elem.name === name);
            if (result.length !== 0) {
                // maybe set a state to show an error because of file with same name exists
                return;
            }
            this.props.onCreatedFile(name);
        });

    }

    render() {
        const { files, classes, selectedFileIndex, newFile, fileSaved } = this.props;
        return (
            <div>
                {files.map((fileObj: { name: string, content: string }, index: number) => (
                    <div
                        className="fileItem"
                        key={`${fileObj.name}${index + 1}`}
                    >
                        <FileItem
                            isSelected={selectedFileIndex == index}
                            onSelect={this.props.makeHandleClickFile(index)}
                            onDelete={this.props.makeHandleDeleteFile(index)}
                            isSaved={fileSaved[index]}
                            name={fileObj.name}
                            key={`${fileObj.name}${index + 2}`}
                        />
                    </div>
                ))}
                {/* New file field goes here */}
            </div>
        );
    }
}
export default withStyles(styles)(UserFiles);