import * as Rx from 'rxjs';
import * as elementaryJS from '@stopify/elementary-js';
import * as elementaryRTS from '@stopify/elementary-js/dist/runtime';
import * as types from './types';
import * as state from './state';
import { console } from './errors';
import { getJson, getText } from './utils';
import { MODULE_WL_URL } from './secrets';
import { OCELOTVERSION } from './version';
import { EJSVERSION } from '@stopify/elementary-js/dist/version';

export type Mode = 'running' | 'stopped' | 'stopping';

export function version() {
    return {
        elementaryJS: EJSVERSION,
        ocelot: OCELOTVERSION
    };
}

let ws: WebSocket | undefined,
    whitelistCode: { [key: string]: string } = {};
export async function loadLibraries() {
    const wl: { [key: string]: string } = await getJson(MODULE_WL_URL);

    for (const module in wl) {
        wl[module] = await getText(wl[module]);
    }

    ws = wl.robotLibrary ? new WebSocket('ws://localhost:8000') : undefined;

    whitelistCode = wl;
}

// NOTE(arjun): I consider this to be hacky. Stopify should have a
// function to create an AsyncRun that does not run any user code.
function emptyStopifyRunner(opts: elementaryJS.CompilerOpts) {
    const runner = elementaryJS.compile('', opts);
    if (runner.kind === 'error') {
        // Panic situation!
        throw new Error('Could not create empty ElementaryJS.AsyncRun');
    }
    // In theory, this is a race condition. In practice, Stopify is not going
    // to yield control, so the callback will run before the function returns.
    runner.run((result) => {
        if (result.type === 'exception') {
            // Panic situation!
            throw new Error('Could not evaluate empty program with ElementaryJS');
        }
    });
    return runner;
}

/**
 * Implements the web-based sandbox that uses ElementaryJS.
 * The rest of the program should not have to use ElementaryJS.
 *
 * To initialize the sandbox, the following methods must be invoked after
 * construction:
 *
 * 1. setConsole, to hold a reference to the console
 *
 * When the user's program changes, call setCode. Note that this does *not*
 * recompile the program.
 *
 * Finally, use onRunClick, onConsoleInput, and onStopClicked to actually
 * control program execution.
 *
 */
export class Sandbox {

    private runner: elementaryJS.CompileOK;
    private repl!: types.HasConsole; // bang is 'definite assignment'
    public mode: Rx.BehaviorSubject<Mode>;

    constructor() {
        this.runner = emptyStopifyRunner(this.opts());
        this.mode = new Rx.BehaviorSubject<Mode>('stopped');

        if (ws) {
            ws.onopen = (e) => { this.repl.log('Connected.'); };
            ws.onclose = (e) => { this.repl.error('Disconnected.'); };
            ws.onerror = (e) => { this.repl.error('Network error.'); };
        }
    }

    setConsole(console: types.HasConsole) {
        this.repl = console;
    }

    private onResult(result: elementaryJS.Result, showNormal: boolean) {
        if (result.type === 'exception') {
            let message = result.value instanceof Error ?
              result.value.message : String(result.value);
            if (result.stack.length === 0) {
                this.repl.error(message);
                return;
            }
            message = message + ' at ' + result.stack[0];
            if (result.stack.length === 1) {
                this.repl.error(message);
                return;
            }
            this.repl.error(message + '\n... ' +
                result.stack.slice(1).join('\n... '));
        } else if (result.type === 'normal' && showNormal) {
            this.repl.log(result.value);
        }
    }

    private reportElementaryError(error: elementaryJS.CompileError) {
        for (const err of error.errors) {
            this.repl.error(`Line ${err.line}: ${err.message}`);
        }
    }

    opts() {
        return {
            consoleLog: (message: string) => this.repl!.log(message),
            version, whitelistCode, ws
        };
    }
    onRunClicked() {
        const program = state.currentProgram.getValue();
        if (program.kind !== 'program') {
            console.error(`Clicked Run with currentProgram.kind === ${program.kind}`);
            return;
        }
        this.repl.log(new Date().toLocaleString('en-us', { timeZoneName: 'short' }));
        this.repl.log('Compiling...');
        const runner = elementaryJS.compile(program.content, this.opts());
        if (runner.kind === 'error') {
            this.reportElementaryError(runner);
            return;
        }
        this.repl.log('Compilation succesful.');
        this.repl.log('Starting program...');
        this.runner = runner;
        elementaryRTS.enableTests(false);
        this.mode.next('running');
        runner.run(result => {
            this.onResult(result, false);
            if (result.type === 'normal') {
                this.repl.log('Program terminated normally.');
            }
            this.mode.next('stopped');
        });
    }

    onConsoleInput(userInputLine: string) {
        const currentMode = this.mode.getValue();
        if (currentMode !== 'stopped') {
            console.error(`ERROR: called onConsoleInput with mode = ${currentMode}`);
            return;
        }
        this.repl.echo(userInputLine);
        this.mode.next('running');
        this.runner.eval(
            userInputLine,
            (result: elementaryJS.Result) => {
              this.mode.next('stopped');
              this.onResult(result, true);
        });
    }

    onStopClicked() {
        const currentMode = this.mode.getValue();
        if (currentMode === 'stopped') {
            console.error(`Clicked Stop while in mode ${this.mode}`);
            return;
        }
        if (currentMode === 'stopping') {
            // NOTE(arjun): I think this can happen and is less surprising.
            // E.g., a student may click a button several times
            return;
        }
        this.mode.next('stopping');
        this.runner.stop(() => {
          // NOTE: We do *not* remove the asyncRun object. This will allow
          // a user to continue mucking around in the console after killing a
          // running program.
          this.mode.next('stopped');
        });
    }

}
