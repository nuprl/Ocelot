import * as React from 'react';
import LoginButton from '../../containers/LoginButton';
import AppbarLogin from './components/AppbarLogin'


/*
 * Note to whoever reading this:
 * Presentational Components (grouped as components)
 * are structured so that they can have other presentational
 * components in their subdirectory.
 * If it needs to use container components (grouped as containers),
 * it can use it but all container components must go in the containers folder.
 * The reason is that it's a lot cleaner. I can easily check
 * if a reducer is missing by checking the containers folder.
 * This is just a little rule set by me
 * - Sam L.
 */

type MenuAppbarProps = {
    title: string,
}


export default function MenuAppbar(props: MenuAppbarProps) {
    return (
        <AppbarLogin title={props.title}>
            <LoginButton />
        </AppbarLogin>
    );
}