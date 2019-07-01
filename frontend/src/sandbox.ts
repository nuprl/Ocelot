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

const simMap: { [key: string]: string } = {
    'ocelot-1@cs.umass.edu': '10.0.0.106:8001',
    'ocelot-2@cs.umass.edu': '10.0.0.107:8002',
    'ocelot-3@cs.umass.edu': '10.0.0.106:8003',
    'ocelot-4@cs.umass.edu': '10.0.0.107:8004',
    'ocelot-5@cs.umass.edu': '10.0.0.106:8005',
    'ocelot-6@cs.umass.edu': '10.0.0.107:8006',
    'ocelot-7@cs.umass.edu': '10.0.0.106:8007',
    'ocelot-8@cs.umass.edu': '10.0.0.107:8008',
    'ocelot-9@cs.umass.edu': '10.0.0.106:8009',
    'ocelot-10@cs.umass.edu': '10.0.0.107:8010',
    'ocelot-11@cs.umass.edu': '10.0.0.106:8011',
    'ocelot-12@cs.umass.edu': '10.0.0.107:8012',
    'ocelot-13@cs.umass.edu': '10.0.0.106:8013',
    'ocelot-14@cs.umass.edu': '10.0.0.107:8014',
    'ocelot-15@cs.umass.edu': '10.0.0.106:8015'
};

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

export type Mode = 'running' | 'stopped' | 'stopping';

export function version() {
    return {
        elementaryJS: EJSVERSION,
        ocelot: OCELOTVERSION
    };
}

let whitelistCode: { [key: string]: string } = {};
export async function loadLibraries() {
    const wl: { [key: string]: string } = await getJson(MODULE_WL_URL);

    for (const module in wl) {
        wl[module] = await getText(wl[module]);
    }

    whitelistCode = wl;
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
    private ws: WebSocket | undefined;
    private runner: elementaryJS.CompileOK;
    private repl!: types.HasConsole; // bang is 'definite assignment'
    public mode: Rx.BehaviorSubject<Mode>;

    constructor() {
        this.runner = emptyStopifyRunner(this.opts());
        this.mode = new Rx.BehaviorSubject<Mode>('stopped');
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

    public setConsole(console: types.HasConsole) {
        this.repl = console;
    }

    public setWS() {
        const email: string | null = localStorage.getItem('userEmail');

        if (email) {
            this.ws = new WebSocket(
                window.location.hostname === 'localhost' ?
                   'ws://localhost:8000' :
                   `ws://${simMap[email] || '10.0.0.107:8000'}`
            );
            this.ws.onopen = e => this.repl.log('Connected.');
            this.ws.onclose = e => this.repl.error('Disconnected.');
            this.ws.onerror = e => this.repl.error('Network error.');
        } else {
            this.ws && this.ws.close(); // tslint:disable-line:no-unused-expression
            delete this.ws;
        }
    }

    public getWS() {
        return this.ws ? this.ws.url.slice(5) : '';
    }

    public opts() {
        return {
            consoleLog: (message: string) => this.repl!.log(message),
            ws: this.ws,
            version, whitelistCode
        };
    }

    public onRunClicked() {
        const program = state.currentProgram.getValue();
        if (program.kind !== 'program') {
            console.error(`Clicked Run with currentProgram.kind === ${program.kind}`);
            return;
        }
        this.repl.log(new Date().toLocaleString('en-us', { timeZoneName: 'short' }));
        const runner = elementaryJS.compile(program.content, this.opts());
        if (runner.kind === 'error') {
            this.reportElementaryError(runner);
            return;
        }
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

    public onConsoleInput(userInputLine: string) {
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

    public onStopClicked() {
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
