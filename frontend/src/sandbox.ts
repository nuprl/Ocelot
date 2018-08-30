import * as Rx from 'rxjs';
import * as elementaryJS from 'elementary-js';
import * as elementaryRTS from 'elementary-js/dist/runtime';
import * as types from './types';
import { console } from './errors';
import * as state from './state';
import { OCELOTVERSION } from './version';
import { EJSVERSION } from 'elementary-js/dist/version';

export type Mode = 'running' | 'testing' | 'stopped' | 'stopping';

export function version() {
    return {
        elementaryJS: EJSVERSION,
        ocelot: OCELOTVERSION
    };
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
 * Finally, use onRunOrTestClick, onConsoleInput, and onStopClicked to actually
 * control program execution.
 *
 */
export class Sandbox {

    private runner: elementaryJS.CompileOK;
    private console!: types.HasConsole; // bang is 'definite assignment'
    public mode: Rx.BehaviorSubject<Mode>;

    constructor() {
        this.runner = emptyStopifyRunner(this.opts());
        this.mode = new Rx.BehaviorSubject<Mode>('stopped');
    }

    setConsole(console: types.HasConsole) {
        this.console = console;
    }


    private onResult(result: elementaryJS.Result, showNormal: boolean) {
        if (result.type === 'exception') {
            let message = result.value instanceof Error ?
              result.value.message : String(result.value);
            if (result.stack.length === 0) {
                this.console.error(message);
                return;
            }
            message = message + ' at ' + result.stack[0];
            if (result.stack.length === 1) {
                this.console.error(message);
                return;
            }
            this.console.error(message + '\n... ' +
                result.stack.slice(1).join('\n... '));
        }
        else if (result.type === 'normal' && showNormal) {
            this.console.log(result.value);
        }
    }

    private reportElementaryError(error: elementaryJS.CompileError) {
        for (const err of error.errors) {
            this.console.error(`Line ${err.line}: ${err.message}`);
        }
    }

    opts() {
        return {
            consoleLog: (message: string) => this.console!.log(message),
            version: version
        }
    }
    onRunOrTestClicked(mode: 'testing' | 'running') {
        const currentMode = this.mode.getValue();
        if (currentMode === 'testing' || currentMode === 'running') {
            console.error(`Clicked Run while in mode ${this.mode}`);
            return;
        }
        const program = state.currentProgram.getValue();
        if (program.kind !== 'program') {
            console.error(`Clicked Run/Test with currentProgram.kind === ${program.kind}`);
            return;
        }
        this.console.log(new Date().toLocaleString('en-us', {timeZoneName:'short'}));
        this.console.log('Compiling...');
        const runner = elementaryJS.compile(program.content, this.opts());
        if (runner.kind === 'error') {
            this.reportElementaryError(runner);
            return;
        }
        this.console.log('Compilation succesful.');
        if (mode === 'running') {
            this.console.log('Starting program...');
        } else if (mode === 'testing') {
            this.console.log('Running tests...');
        }
        this.runner = runner;
        elementaryRTS.enableTests(mode === 'testing');
        this.mode.next(mode);
        runner.run(result => {
            const currentMode = this.mode.getValue();
            this.onResult(result, false);
            if (currentMode === 'testing' && result.type !== 'exception') {
              const summary = elementaryRTS.summary(true);
              this.console.log(summary.output, ...summary.style);
            }
            if (currentMode !== 'testing' && result.type === 'normal') {
                this.console.log('Program terminated normally.');
            }
            this.mode.next('stopped');
        });
    }

    onConsoleInput(userInputLine: string) {
        const currentMode = this.mode.getValue();
        if (currentMode !== 'stopped') {
            console.error(`called onConsoleInput with mode = ${this.mode}`);
            return;
        }
        this.console.echo(userInputLine);
        this.mode.next('running');
        this.runner.eval(
            userInputLine, (result: elementaryJS.Result) => {
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