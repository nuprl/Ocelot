import * as React from 'react';
import update from 'immutability-helper';
import { Hook, Console, Decode } from 'console-feed';
import { inspectorTheme } from './../styles/consoleStyle';

class ConsoleScreen extends React.Component {
  state = {
    logs: [
      {
        method: 'result',
        data: ['Result']
      },
      {
        method: 'command',
        data: ['Command']
      }
    ] as any[],
    filter: []
  };

  componentDidMount() {
    Hook(window.console, (log: any) => {
      const decoded = Decode(log);
      this.setState((state) => update(state, { logs: { $push: [decoded] } }));
    });
  }

  switch = () => {
    const filter = this.state.filter.length === 0 ? ['log'] : [];
    this.setState({
      filter
    });
  };

  render() {
    return (
      <div style={{ backgroundColor: '#242424', overflowY: 'auto', height: 'calc(100% - 48px)'}}>
        {/* <button onClick={this.switch}>Show only logs</button> */}
        <Console
          logs={this.state.logs}
          variant="dark"
          filter={this.state.filter}
          styles={inspectorTheme}
        />
        
      </div>
    );
  }
}

export default ConsoleScreen;