import * as stopify from 'stopify';
import * as elementaryJS from 'elementary-js';
import * as elementaryRTS from 'elementary-js/dist/runtime';
import * as types from './types';
import * as lib220 from 'elementary-js/dist/lib220';
import { console } from './errors';

// TODO(arjun): I think these hacks are necessary for eval to work. We either
// do them here or we do them within the implementation of Stopify. I want
// them here for now until I'm certain there isn't a cleaner way.
(window as any).stopify = stopify;
(window as any).elementaryjs = elementaryRTS;

export type Mode = 'running' | 'testing' | 'stopped' | 'stopping';

// NOTE(arjun): I consider this to be hacky. Stopify should have a
// function to create an AsyncRun that does not run any user code.
function emptyStopifyRunner() {
    const runner = stopify.stopifyLocally('');
    if (runner.kind === 'error') {
        // Panic situation!
        throw new Error('Could not create empty stopify.AsyncRun');
    }
    // In theory, this is a race condition. In practice, Stopify is not going
    // to yield control, so the callback will run before the function returns.
    runner.run((result) => {
        if (result.type === 'exception') {
            // Panic situation!
            throw new Error('Could not evaluate empty program with Stopify');
        }
    });
    return runner;
}

type ModeListener = (mode: Mode) => void;

/**
 * Implements the web-based sandbox that uses both Stopify and ElementaryJS.
 * The rest of the program should not have to use Stopify or ElementaryJS.
 *
 * To initialize the sandbox, the following methods must be invoked after
 * construction:
 *
 * 1. setConsole, to hold a reference to the console
 * 2. addModeListener, to receive updates when the execution mode changes
 *
 * When the user's program changes, call setCode. Note that this does *not*
 * recompile the program.
 *
 * Finally, use onRunOrTestClick, onConsoleInput, and onStopClicked to actually
 * control program execution.
 *
 */
export class Sandbox {

    private runner: stopify.AsyncRun;
    private console!: types.HasConsole; // bang is 'definite assignment'
    private mode: Mode;
    private modeListeners: ModeListener[];
    // TODO(arjun): I'm not happy about this
    private editorCode: string;

    constructor() {
        this.runner = emptyStopifyRunner();
        this.mode = 'stopped';
        this.modeListeners = []
        this.editorCode = '';
    }

    setConsole(console: types.HasConsole) {
        this.console = console;
    }

    addModeListener(listener: ModeListener) {
        this.modeListeners.push(listener);
    }

    setCode(code: string) {
        this.editorCode = code;
    }

    getCode() { return this.editorCode; }

    private setMode(mode: Mode) {
        this.mode = mode;
        for (const listener of this.modeListeners) {
            listener(mode);
        }
    }

    private setGlobals() {
        const g = (this.runner as any).g; // NOTE(arjun): Update Stopify iface
        g.elementaryjs = elementaryRTS;
        g.console = Object.freeze({
          log: (...message: any[]) => this.console.log(...message)
        });
        g.test = elementaryRTS.test;
        g.assert = elementaryRTS.assert;
        g.lib220 = lib220;
        g.Math = Math;
    }

    private onResult(result: stopify.Result) {
        if (result.type === 'exception') {
            if (result.value instanceof Error) {
                this.console.error(result.value.message);
            }
            else {
                this.console.error(result.value);
            }
            for (let line of result.stack) {
                this.console.error(line);
            }
        }
    }

    onRunOrTestClicked(mode: 'testing' | 'running') {
        if (this.mode === 'testing' || this.mode === 'running') {
            console.error(`Clicked Run while in mode ${this.mode}`);
            return;
        }
        const compiled = elementaryJS.compile(this.editorCode, true);
        if (compiled.kind === 'error') {
          for (const err of compiled.errors) {
            this.console.error(`Line ${err.line}: ${err.message}`);
          }
          return;
        }

        const runner = stopify.stopifyLocallyFromAst(compiled.node);
        if (runner.kind === 'error') {
          this.console.error(runner.exception);
          return;
        }
        this.runner = runner;
        this.setGlobals();
        elementaryRTS.enableTests(mode === 'testing', runner);
        this.runner = runner;
        lib220.setRunner(runner);
        this.setMode(mode);
        runner.run(result => {
            this.onResult(result);
            if (this.mode === 'testing' && result.type !== 'exception') {
              const summary = elementaryRTS.summary(true);
              this.console.log(summary.output, ...summary.style);
            }
            this.setMode('stopped');
        });
    }

    onConsoleInput(userInputLine: string) {
        // TODO(arjun): Apply ElementaryJS
        if (this.mode !== 'stopped') {
            console.error(`called onConsoleInput with mode = ${this.mode}`);
            return;
        }
        this.setMode('running');
        (this.runner as any).evalAsync(userInputLine, (result: stopify.Result) => {
            this.setMode('stopped');
            if (result.type === 'normal') {
                this.console.command(userInputLine, result.value, false);
            }
            else {
                this.console.command(userInputLine, result.value, true);
            }
        });
    }

    onStopClicked() {
        if (this.mode === 'stopped') {
            console.error(`Clicked Stop while in mode ${this.mode}`);
            return;
        }
        if (this.mode === 'stopping') {
            // NOTE(arjun): I think this can happen and is less surprising.
            // E.g., a student may click a button several times
            return;
        }
        this.setMode('stopping');
        this.runner.pause((line?: number) => {
          // NOTE: We do *not* remove the asyncRun object. This will allow
          // a user to continue mucking around in the console after killing a 
          // running program.
          this.setMode('stopped');
        });
    }

}