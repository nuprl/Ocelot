/**
 * This module stores the global state of Ocelot.
 * 
 * The simplest approach would be to have several global variables. However,
 * we would need to implement our own mechanism to propagate state changes to
 * the UI.
 * 
 * An alternative approach is to use Redux, but let's not do that. :)
 * 
 * Instead, this module uses RxJS, which provides a lightweight mechanism
 * to subscribe to state changes.
 * 
 * The following statement creates a new variable:
 * 
 *   const myVariable = new Rx.BehaviorSubject(initialValue);
 *
 * To update the variable, use the .next method:
 * 
 *   myVariable.next(newValue)
 * 
 * To read the value in the variable, use the .getValue method:
 * 
 *   myVariable.getValue()
 * 
 * RxJS lets us subscribe to updates:
 * 
 *   myVariable.observe(nextValue => print('Updated to ', nextValue);
 * 
 * Therefore, if some portion of the view depends on myVariable, we can update
 * the view within callback passed to .observe. Unfortunately, we are using React,
 * which does not support imperative updates. However, we can reflect the
 * value of variable into the state of a component and then let the component
 * rely on the state:
 * 
 *   myVariable.observe(nextValue => this.setState({ myVariableReflected: nextValue });
 *
 * The only caveat is that we cannot call setState on a component that is not
 * mounted, so the call above should be in the .componentDidMount method of
 * the React component.
 * 
 * RxJS offers a lot more than just the ability to observe variable updates.
 * There are a bunch of tutorials online. Flapjax implements very similar
 * operations:
 * 
 * https://people.cs.umass.edu/~arjun//papers/2009-meyerovich-oopsla.html
 * 
 */

import * as Rx from 'rxjs';

export type Dirty = 'dirty' | 'saving' | 'saved';
export type NotificationPosition = 'top' | 'bottom-right';
export type Notification = { message: string, position: NotificationPosition };

export type LoggedIn = 
    { kind: 'logged-out' }
  | { kind: 'loading-files', email: string }
  | { kind: 'logged-in', email: string };

export const emptyFile = {
    name: 'untitled.js',
    content: ''
};

////////////////////////////////////////////////////////////////////////////////
// The state of the system

export type LoadedProgram = {  kind: 'program', name: string, content: string };

export type Program =
       { kind: 'nothing' }
     | { kind: 'loading' }
     | LoadedProgram;

export const currentProgram = new Rx.BehaviorSubject<Program>({ kind: 'nothing' });
export const files = new Rx.BehaviorSubject<string[]>([]);

// This state is set in several places: (1) the editor sets it to dirty,
// (2) the autosaver sets it to saving and saved.
export const dirty = new Rx.BehaviorSubject<Dirty>('saved');

// This is set by the login/logout button.
export const loggedIn = new Rx.BehaviorSubject<LoggedIn>({ kind: 'logged-out' });

// Derived from loggedIn
export const uiActive = new Rx.BehaviorSubject<boolean>(false);

function isUiActive(loggedIn: LoggedIn): boolean {
    if (window.location.search === '?anonymous') {
        return true;
    }
    return loggedIn.kind === 'logged-in';
}

loggedIn.subscribe(x => uiActive.next(isUiActive(x)));

////////////////////////////////////////////////////////////////////////////////
// Channels to communicate across components

// Send values to this subject to have the editor load a new program. Do not
// send values when the code in the editor changes. This is not a
// BehaviorSubject, because the last value it receives may not be the current
// state of a file.
export const loadProgram = new Rx.Subject<Program>();

// Send values to this subject to display a little notification.
export const notification = new Rx.Subject<Notification>();

////////////////////////////////////////////////////////////////////////////////
// Convenient functions

export function currentFileName(): string {
    const f = currentProgram.getValue();
    if (f.kind !== 'program') {
        return '';
    }
    return f.name;
}

export function email(): string | false {
    const f = loggedIn.getValue();
    if (f.kind === 'logged-out') {
        return false;
    }
    return f.email;
}

export function notify(message: string) {
    notification.next({ position: 'top', message });
}