import * as React from 'react';
import { Console } from 'console-feed';
import { inspectorTheme } from '../../../../static/styles/consoleStyle';
import { Log } from '../../types';
import 'static/styles/Scrollbar.css';
// NOTE TO SELF, Filtering of logs are possible, maybe nice to include
// There's a difference between code input and output, so use that for the repl
// Current bug: Console feed 'remembers' it's console method 
type Props = {
  logs: Log[],
};

class ConsoleIO extends React.Component<Props> {
  logRef: HTMLDivElement | null = null;

  componentDidUpdate() {
    if (this.logRef !== null) {
      this.logRef.scrollTop = this.logRef.scrollHeight;
    }
  }

  render() {
    const { logs } = this.props;

    return (
      <div
        className="scrollbars"
        style={{ backgroundColor: '#242424', overflowY: 'auto', overflowX: 'hidden', flexGrow: 1 }}
        ref={(divElem) => this.logRef = divElem}
      >
        {/* <button onClick={this.switch}>Show only logs</button> */}
        <Console
          logs={logs as any}
          variant="dark"
          styles={inspectorTheme}
        />

      </div>
    );
  }

}

export default ConsoleIO;