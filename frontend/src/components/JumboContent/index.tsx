import * as React from 'react';
import SplitPane from 'react-split-pane';
import CanvasOutput from 'components/CanvasOutput';
import OutputPanel from 'containers/OutputPanel';
import EditorSuite from 'components/EditorSuite';
import 'static/styles/SplitPane.css';

const JumboContent: React.StatelessComponent = () => (
    <SplitPane
        split="horizontal"
        minSize={48}
        defaultSize="30%"
        primary="second"
    >
        <SplitPane
            split="vertical"
            defaultSize="50%"
            primary="second"
            minSize={0}
        >
            <EditorSuite />
            <CanvasOutput />
        </SplitPane>
        <OutputPanel />
    </SplitPane>
);

export default JumboContent;