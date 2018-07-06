import * as React from 'react';
import { Hook, Console, Decode } from 'console-feed';
import { inspectorTheme } from 'static/styles/consoleStyle';
import 'static/styles/ConsoleScreen.css';
// import ConsoleInput from './ConsoleInput';
import { RootState } from 'store/';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { addNewLog, removeOldLogs } from 'store/consoleLogs/actions';
// NOTE TO SELF, Filtering of logs are possible, maybe nice to include
// There's a difference between code input and output, so use that for the repl
// Current bug: Console feed 'remembers' it's console method 
type Log = {
  data: any[],
  id: string,
  method: string,
};

type Props = {
  logs: Log[]
  addNewLog: (decodeLog: Log) => void,
  removeOldLogs: (amount: number) => void,
};

class ConsoleIO extends React.Component<Props> {
  logRef: HTMLDivElement | null = null;
  intervalId: NodeJS.Timer;

  constructor(props: Props) {
    super(props);
    this.intervalId = setInterval(
      () => {
        const logLength = this.props.logs.length;
        if (logLength > 230) {
          this.props.removeOldLogs(Math.floor(logLength * 0.35));
        }
      },
      3000
    );
  }

  componentDidUpdate() {
    if (this.logRef !== null) {
      this.logRef.scrollTop = this.logRef.scrollHeight;
    }
  }

  componentDidMount() {
    Hook(window.console, (log: any) => {
      const decodedLog = Decode(log);
      this.props.addNewLog(decodedLog);
    });
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    const { logs } = this.props;

    return (
      <div
        className="scrollbars"
        style={{ backgroundColor: '#242424', overflowY: 'auto', flexGrow: 1 }}
        ref={(divElem) => this.logRef = divElem}
      >
        {/* <button onClick={this.switch}>Show only logs</button> */}
        <Console
          logs={logs}
          variant="dark"
          styles={inspectorTheme}
        />

      </div>
    );
  }

}

const mapStateToProps = (state: RootState) => ({
  logs: state.consoleLogs.logs
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addNewLog: (newLog: Log) => { dispatch(addNewLog(newLog)); },
  removeOldLogs: (amount: number) => { dispatch(removeOldLogs(amount)); }
});

export default connect(mapStateToProps, mapDispatchToProps)(ConsoleIO);