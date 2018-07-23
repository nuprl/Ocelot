import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { closeNotification } from '../../store/notification/actions';
import NotificationBar from './components/NotificationBar';
import { RootState } from '../../store/';

/**
 * Get the current state of the error notification
 * The state and the message of the error notification
 * The open and message will be props for ErrorSnackbar
 *
 * @param {RootState} state
 */
const mapStateToProps = (state: RootState) => ({
    open: state.notification.open,
    message: state.notification.message,
    position: state.notification.position,
});
/**
 * Using the dispatch function, make a handleClose function
 * that will close the error notification, this function
 * will be given to ErrorSnackbar as props
 * 
 * @param {Dispatch} dispatch
 */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    handleClose: () => { dispatch(closeNotification()); }
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationBar);