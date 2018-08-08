import * as elementaryRTS from 'elementary-js/dist/runtime';
import * as types from './types';
import * as lib220 from 'elementary-js/dist/lib220';
let visibleConsole : types.HasConsole;

export function setConsole(visibleConsole_: types.HasConsole) {
  visibleConsole = visibleConsole_;
}

export function setGlobals(g: any) {
  g.elementaryjs = elementaryRTS;
  g.console = Object.freeze({
    log: function(...message: any[]) {
      visibleConsole.appendLogMessage({ method: 'log', data: [...message] });
    }
  });
  g.test = elementaryRTS.test;
  g.assert = elementaryRTS.assert;
  g.lib220 = lib220;
  g.Math = Math;
}

