import * as Rx from 'rxjs';
import * as React from 'react';

/**
 * Updates an element of the component's state whenever an observable changes.
 *
 * Use this function in the constructor of a component after initializing the
 * state. E.g.,
 *
 * this.state = { x: initialValue }; // Initial other elements here
 * connect(this, 'x', observableX);
 *
 */
export function connect<P, S extends { [Key in K]: T }  , T, K extends keyof S>(
    component: React.Component<P, S>,
    key: K,
    observable: Rx.Observable<T>) {

    const didMount = component.componentDidMount;
    const willUnmount = component.componentWillUnmount;
    let subscription: Rx.Subscription | undefined;

    component.componentDidMount = () => {
        if (didMount) {
            didMount.call(component);
        }
        subscription = observable.subscribe(value =>
            component.setState({ [key]: value } as any));
    };

    component.componentWillUnmount = () => {
        if (willUnmount) {
            willUnmount.call(component);
        }
        if (subscription) {
            subscription.unsubscribe();
            subscription = undefined;
        }
    };
}