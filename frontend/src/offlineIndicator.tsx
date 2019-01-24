import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import { notify } from './state';

/**
 * A little component that shows "Offline" when the user is offline and
 * nothing when online. In addition, when transitioning to offline, it displays
 * a little notification. It does not display a notification when transitioning
 * to online.
 */
export class OfflineIndicator extends React.Component<{}, { online: boolean }> {

    private onOfflineOnline : ((e : Event) => void);

    constructor(props: {}) {
        super(props);
        this.state = { online: window.navigator.onLine };
        this.onOfflineOnline = (e: Event) => {
            if (window.navigator.onLine === false) {
                notify('Internet connection lost. No changes will be saved until you reconnect.');
            }
            this.setState({ online: window.navigator.onLine });
        };
    }

    componentDidMount() {
        window.addEventListener('online', this.onOfflineOnline);
        window.addEventListener('offline', this.onOfflineOnline);
    }

    componentWillUnmount() {
        window.removeEventListener('online', this.onOfflineOnline);
        window.removeEventListener('offline', this.onOfflineOnline);
    }

    render() {
        return <Typography variant="subheading" color="error">
            {this.state.online ? '' : 'offline'}
        </Typography>;
    }
}