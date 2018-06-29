import { Action, Reducer } from 'redux';
import { BatchActions, AllStates } from './types';
import { RootState } from '../';

// Taken from: https://github.com/reduxjs/redux/issues/911#issuecomment-149361073
// A batching action creator, groups multiple actions together

export const batchActions = (...actions: Action[]): BatchActions => ({
    type: 'BATCH_ACTIONS',
    actions: actions,
});

// A high order reducer
export const enableBatching = (reducer: Reducer<RootState>) => {
    return function batchingReducer(state: AllStates, action: Action): AllStates {
        switch (action.type) {
            case 'BATCH_ACTIONS':
                return (action as BatchActions).actions.reduce(batchingReducer, state);
            default:
                return reducer(state, action);
        }
    };
};