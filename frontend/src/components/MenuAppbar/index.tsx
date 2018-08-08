import * as React from 'react';
import UserLogin from '../../containers/UserLogin';
import TitledAppbar from './components/TitledAppbar';
import HistoryButton from '../../containers/HistoryButton';

type MenuAppbarProps = {
    title: string,
};

export default function MenuAppbar(props: MenuAppbarProps) {
    return (
        <TitledAppbar title={props.title}>
            <HistoryButton />
            <div style={{ display: 'inline-block', width: '0.5em' }} />
            <UserLogin />
        </TitledAppbar>
    );
}