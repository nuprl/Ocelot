import * as elementaryRTS from 'elementary-js/dist/runtime';
import * as celotTestingRuntime from 'elementary-js/dist/runtime-testing'
import * as types from './types';

let visibleConsole : types.HasConsole;

export function setConsole(visibleConsole_: types.HasConsole) {
  visibleConsole = visibleConsole_;
}

export function setGlobals(g: any) {
  g.elementaryjs = elementaryRTS;
  g.console = Object.freeze({
    log: function(message: any) {
      visibleConsole.appendLogMessage({ method: 'log', data: [message] });
    }
  });
  g.celot = celotTestingRuntime;
  g.lib220 = (window as any).lib220;
  g.Math = Math;
}

