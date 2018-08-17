import * as stopify from 'stopify';
import * as elementaryJS from 'elementary-js';
import * as elementaryRTS from 'elementary-js/dist/runtime';
import * as types from './types';
import * as lib220 from 'elementary-js/dist/lib220';
import { console } from './errors';
import * as state from './state';

// TODO(arjun): I think these hacks are necessary for eval to work. We either
// do them here or we do them within the implementation of Stopify. I want
// them here for now until I'm certain there isn't a cleaner way.
(window as any).stopify = stopify;
(window as any).elementaryjs = elementaryRTS;

export type Mode = 'running' | 'testing' | 'stopped' | 'stopping';

const compileOpts: Partial<stopify.CompilerOpts> = {
    hofs: 'fill'
};

// NOTE(arjun): I consider this to be hacky. Stopify should have a
// function to create an AsyncRun that does not run any user code.
function emptyStopifyRunner() {
    const runner = stopify.stopifyLocally('', compileOpts);
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

    private runner: stopify.AsyncRun & stopify.AsyncEval;
    private console!: types.HasConsole; // bang is 'definite assignment'
    private mode: Mode;
    private modeListeners: ModeListener[];

    constructor() {
        this.runner = emptyStopifyRunner();
        this.setGlobals();
        this.mode = 'stopped';
        this.modeListeners = []
    }

    setConsole(console: types.HasConsole) {
        this.console = console;
    }

    addModeListener(listener: ModeListener) {
        this.modeListeners.push(listener);
    }

    private setMode(mode: Mode) {
        this.mode = mode;
        for (const listener of this.modeListeners) {
            listener(mode);
        }
    }

    private setGlobals() {
        // These are the globals passed to ElementaryJS.
        const globals = {
            elementaryjs: elementaryRTS,
            console: Object.freeze({
                log: (...message: any[]) => this.console.log(...message)
            }),
            test: elementaryRTS.test,
            assert: elementaryRTS.assert,
            lib220: Object.freeze(lib220),
            Array: elementaryRTS.Array,
            Math: Math,
            undefined: undefined,
            Object: Object // Needed for classes
        };

        // We can use .get and .set traps to intercept reads and writes to
        // global variables. Any other trap is useless (I think), since Stopify
        // does not use the global object in any other way.
        const globalProxy = new Proxy(globals, {
            get: (o, k) => {
                if (!Object.hasOwnProperty.call(o, k)) {
                    const msg = `${String(k)} is not defined`;
                    throw new elementaryRTS.ElementaryRuntimeError(msg);
                }
                return (o as any)[k];
            }
        });

        this.runner.g = globalProxy;
    }

    private onResult(result: stopify.Result, showNormal: boolean) {
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

    onRunOrTestClicked(mode: 'testing' | 'running') {
        if (this.mode === 'testing' || this.mode === 'running') {
            console.error(`Clicked Run while in mode ${this.mode}`);
            return;
        }
        this.console.log(new Date().toLocaleString('en-us', {timeZoneName:'short'}));
        this.console.log('Compiling...');
        const compiled = elementaryJS.compile(state.currentProgram.getValue(), true);
        if (compiled.kind === 'error') {
            this.reportElementaryError(compiled);
            return;
        }
        this.console.log('Compilation succesful.');
        if (mode === 'running') {
            this.console.log('Starting program...');
        } else if (mode === 'testing') {
            this.console.log('Running tests...');
        }
        const runner = stopify.stopifyLocallyFromAst(compiled.node, undefined, compileOpts);
        if (runner.kind === 'error') {
          this.console.error(runner.exception);
          return;
        }
        this.runner = runner;
        this.setGlobals();
        elementaryRTS.setRunner(runner);
        elementaryRTS.enableTests(mode === 'testing', runner);
        this.setMode(mode);
        runner.run(result => {
            this.onResult(result, false);
            if (this.mode === 'testing' && result.type !== 'exception') {
              const summary = elementaryRTS.summary(true);
              this.console.log(summary.output, ...summary.style);
            }
            if (this.mode !== 'testing' && result.type === 'normal') {
                this.console.log('Program terminated normally.');
              }
            this.setMode('stopped');
        });
    }

    onConsoleInput(userInputLine: string) {
        if (this.mode !== 'stopped') {
            console.error(`called onConsoleInput with mode = ${this.mode}`);
            return;
        }
        this.console.echo(userInputLine);
        const elementaryResult = elementaryJS.compile(userInputLine, true);
        if (elementaryResult.kind === 'error') {
            this.reportElementaryError(elementaryResult);
            return;
        }
        this.setMode('running');
        this.runner.evalAsyncFromAst(
            elementaryResult.node, (result: stopify.Result) => {
            this.setMode('stopped');
            this.onResult(result, true);
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