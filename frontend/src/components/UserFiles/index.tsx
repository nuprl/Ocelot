import * as React from 'react';
import UserFileItems from 'containers/UserFileItems';
import NewFileField from 'containers/NewFileField';

const UserFiles: React.StatelessComponent = () => (
    <div>
        <UserFileItems />
        <NewFileField />
    </div>
);

export default UserFiles;