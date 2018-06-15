import * as React from 'react';
import update from 'immutability-helper';
import { Hook, Console, Decode } from 'console-feed';
import { inspectorTheme } from '../static/consoleStyle';
import '../static/ConsoleScreen.css';
import ConsoleInput from './ConsoleInput';

class ConsoleScreen extends React.Component {
  state = {
    logs: [
      // {
      //   method: 'result',
      //   data: ['Result']
      // },
      // {
      //   method: 'command',
      //   data: ['Command']
      // }
    ] as any[],
    filter: []
  };
  logRef: HTMLDivElement | null = null;

  componentDidMount() {
    Hook(window.console, (log: any) => {
      const decoded = Decode(log);
      this.setState((state) => update(state, { logs: { $push: [decoded] } }));
    });
  }

  componentDidUpdate() {
    if (this.logRef !== null) {
      this.logRef.scrollTop = this.logRef.scrollHeight;
    }
  }

  switch = () => {
    const filter = this.state.filter.length === 0 ? ['log'] : [];
    this.setState({
      filter
    });
  };

  render() {
    return (
      <div style={{height: 'calc(100% - 48px)', flexDirection: 'column', display: 'flex'}}>
        <div
          className="scrollbars"
          style={{ backgroundColor: '#242424', overflowY: 'auto', flexGrow: 1}}
          ref={(divElem) => this.logRef = divElem}
        >
          {/* <button onClick={this.switch}>Show only logs</button> */}
          <Console
            logs={this.state.logs}
            variant="dark"
            filter={this.state.filter}
            styles={inspectorTheme}
          />

        </div>
        <ConsoleInput />
      </div>
    );
  }
}

export default ConsoleScreen;