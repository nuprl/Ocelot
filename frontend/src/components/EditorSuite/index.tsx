import * as React from 'react';
import RunButton from '../../containers/RunButton';
import CodeEditor from '../../containers/CodeEditor';
import TestButton from '../../containers/TestButton';

const EditorSuite: React.StatelessComponent = () => (
    <div style={{ width: '100%', height: '100%' }}>
        <RunButton />
        <TestButton />
        <CodeEditor />
    </div>
);

export default EditorSuite;