import {
    getUrl,
    validEmailSession,
    FailureResponse,
    SuccessResponse,
    failureResponse,
    FileChange,
    successResponse
} from './apiHelpers';

import { EJSVERSION } from '@stopify/elementary-js/dist/version';
import { OCELOTVERSION } from '../../version';

export type SaveFilesResponse = SuccessResponse<{ message: string }> | FailureResponse;

export const saveChanges = async (fileChanges: FileChange): Promise<SaveFilesResponse> => {

    if (!validEmailSession()) {
        return failureResponse('Seems like your session expired, try logging in again');
    }

    const url = getUrl('changefile');
    const userEmail = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    const data = { userEmail: userEmail,
        sessionId: sessionId,
        fileChanges: fileChanges,
        ejsVersion: EJSVERSION,
        ocelotVersion: OCELOTVERSION
    };

    try {
        const response = await fetch(url, { // send json data to specified URL
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            // create snackbar
            return failureResponse('Something went wrong, try refreshing the page');
        }

        const jsonResponse = await response.json(); // get json response

        if (jsonResponse.status === 'error') {
            // create snackbar
            return failureResponse('Something went wrong, try refreshing the page');
        }

        if (jsonResponse.status === 'failure') {
            // create snackbar
            return failureResponse('Something went wrong, try refreshing the page');
        }
        return successResponse<{ message: string }>({message: 'Changes saved'});

    } catch (error) {
        return failureResponse('Something went wrong, try refreshing the page');
    }
};