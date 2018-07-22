import * as React from 'react';
import UserLogin from '../../containers/UserLogin';
import TitledAppbar from './components/TitledAppbar';
import AppbarButtons from '../AppbarButtons';

type MenuAppbarProps = {
    title: string,
};

export default function MenuAppbar(props: MenuAppbarProps) {
    return (
        <TitledAppbar title={props.title}>
            <AppbarButtons />
            <UserLogin />
        </TitledAppbar>
    );
}