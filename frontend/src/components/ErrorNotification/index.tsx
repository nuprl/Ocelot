import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { closeErrorNotification } from './actions';
import ErrorSnackbar from './components/ErrorSnackbar'
import { ErrorNotificationState } from './constants';

const mapStateToProps = (state: ErrorNotificationState) => ({
    open: state.open,
    message: state.message
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    handleClose: () => dispatch(closeErrorNotification())
})

export default connect(mapStateToProps, mapDispatchToProps)(ErrorSnackbar);