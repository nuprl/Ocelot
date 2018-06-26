import * as React from 'react';
import LoginButton from '../LoginButton';
import AppbarLogin from './components/AppbarLogin'

type MenuAppbarProps = {
    title: string,
}

// TODO(SamL): How do I make it so that LoginButton gets the props
// from redux but not get it from AppBar or MenuAppbar?

export default function MenuAppbar(props: MenuAppbarProps) {
    return (
        <AppbarLogin title={props.title}>
            <LoginButton />
        </AppbarLogin>
    );
}