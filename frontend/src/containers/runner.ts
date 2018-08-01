import * as elementaryRTS from 'elementary-js/dist/runtime';
import * as celotTestingRuntime from 'elementary-js/dist/runtime-testing'

export function setGlobals(g: any) {
  g.elementaryjs = elementaryRTS;
  g.console = window.console;
  g.celot = celotTestingRuntime;
  g.Math = Math;
}
