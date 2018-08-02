import * as elementaryRTS from 'elementary-js/dist/runtime';
import * as celotTestingRuntime from 'elementary-js/dist/runtime-testing'

export function setGlobals(g: any) {
  g.elementaryjs = elementaryRTS;
  g.console = window.console;
  g.celot = celotTestingRuntime;
  g.lib220 = (window as any).lib220;
  g.Math = Math;
}

