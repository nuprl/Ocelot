import * as React from 'react';
import UserLogin from '../../containers/UserLogin';
import AppbarLogin from './components/AppbarLogin';

type MenuAppbarProps = {
    title: string,
};

export default function MenuAppbar(props: MenuAppbarProps) {
    return (
        <AppbarLogin title={props.title}>
            <UserLogin />
        </AppbarLogin>
    );
}