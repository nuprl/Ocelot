import * as React from 'react';
import RunStopButton from 'containers/RunStopButton';
import CodeEditor from 'containers/CodeEditor';
import TestButton from 'containers/TestButton';

const EditorSuite: React.StatelessComponent = () => (
    <div style={{ width: '100%', height: '100%' }}>
        <RunStopButton />
        <TestButton />
        <CodeEditor />
    </div>
);

export default EditorSuite;