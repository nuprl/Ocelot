import * as t from './types';
import { ActionCreator } from 'redux';

export const createCodeRunner: ActionCreator<t.CreateCodeRunnerAction>
    = (runner: any) => ({
        type: t.CREATE_CODE_RUNNER,
        runner: runner,
    });

export const removeCodeRunner: ActionCreator<t.RemoveCodeRunnerAction>
    = () => ({
        type: t.REMOVE_CODE_RUNNER
    });