import * as React from 'react';
import SplitPane from 'react-split-pane';
import CanvasOutput from '../CanvasOutput';
import OutputPanel from '../../containers/OutputPanel';
import EditorSuite from '../EditorSuite';
import 'static/styles/SplitPane.css';

const JumboContent: React.StatelessComponent = () => (
    <SplitPane
        split="horizontal"
        minSize={48}
        defaultSize="25%"
        primary="second"
    >
        <SplitPane
            split="vertical"
            defaultSize="50%"
            minSize={0}
            pane1Style={{maxWidth: '100%'}}
        >
            <EditorSuite />
            <CanvasOutput />
        </SplitPane>
        <OutputPanel />
    </SplitPane>
);

export default JumboContent;