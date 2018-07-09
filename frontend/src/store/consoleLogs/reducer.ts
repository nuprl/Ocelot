import { Reducer } from 'redux';
import {
    ADD_NEW_LOG,
    ConsoleLogsState,
    ConsoleLogsActions,
    REMOVE_OLD_LOGS
} from './types';

const initialState: ConsoleLogsState = {
    logs: []
};

const consoleLogs: Reducer<ConsoleLogsState, ConsoleLogsActions> = (
    state: ConsoleLogsState = initialState,
    action: ConsoleLogsActions): ConsoleLogsState => {
    switch (action.type) {
        case ADD_NEW_LOG:
            return {
                logs: [
                    ...state.logs,
                    action.log
                ]
            };
        case REMOVE_OLD_LOGS:
            return {
                logs: state.logs.filter((log, index) => index >= action.amount)  
            };
        default:
            return state;
    }
};

export default consoleLogs;