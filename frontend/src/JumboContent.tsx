import * as React from 'react';
import SplitPane from 'react-split-pane';
import CanvasOutput from './components/CanvasOutput';
import OutputPanel from './OutputPanel';
import 'static/styles/SplitPane.css';
import RunButton from './RunButton';
import CodeEditor from './containers/CodeEditor';
import TestButton from './TestButton';

import { AsyncRun } from 'stopify';

class JumboContent extends React.Component<{}, { asyncRunner: AsyncRun | undefined }> {

    constructor(props: {}) {
        super(props);
        this.setState({ asyncRunner: undefined });
    }

    setRunner(asyncRunner: AsyncRun) {
        this.setState({ asyncRunner: asyncRunner });
    }

    getRunner(): AsyncRun | undefined {
        return this.state.asyncRunner;
    }

    render() {
      return <SplitPane split="horizontal"  minSize={48} defaultSize="25%"
                    primary="second">
                <SplitPane
                    split="vertical"
                    defaultSize="50%"
                    minSize={0}
                    pane1Style={{maxWidth: '100%'}}>
                    <div style={{ width: '100%', height: '100%' }}>
                        <RunButton setRunner={(runner) => this.setRunner(runner)} />
                        <TestButton />
                        <CodeEditor />
                    </div>

                    <CanvasOutput />
                </SplitPane>
                <OutputPanel getRunner={() => this.getRunner()} />
            </SplitPane>;
    }

}

export default JumboContent;