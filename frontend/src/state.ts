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
 *   myVariable.observe(nextValue => console.log('Updated to ', nextValue);
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
import * as monacoEditor from 'monaco-editor';

 // import * as RxOps from 'rxjs/operators';

export const loggedIn = new Rx.BehaviorSubject<boolean>(false);
export const email = new Rx.BehaviorSubject<string>("");

export const filesLoading = new Rx.BehaviorSubject<boolean>(false);

export const uiActive = new Rx.BehaviorSubject<boolean>(false);

loggedIn.subscribe(x => uiActive.next(x && !filesLoading.getValue()));

filesLoading.subscribe(y => uiActive.next(loggedIn.getValue() && !y));

export const editor = new Rx.BehaviorSubject<monacoEditor.editor.IStandaloneCodeEditor | undefined>(undefined);