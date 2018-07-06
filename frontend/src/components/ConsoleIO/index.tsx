import * as React from 'react';
import ConsoleOutput from 'containers/ConsoleOutput';

const ConsoleIO: React.StatelessComponent = () => (
  <div style={{ height: 'calc(100% - 48px)', flexDirection: 'column', display: 'flex' }}>
    <ConsoleOutput />
    {/* <ConsoleInput /> */}
  </div>
);

export default ConsoleIO;