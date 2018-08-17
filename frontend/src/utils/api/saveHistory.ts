import {
    failureResponse,
    successResponse,
    validEmailSession,
    FailureResponse,
    getUrl,
    SuccessResponse
} from './apiHelpers';

import { EJSVERSION } from 'elementary-js/dist/version';
import { OCELOTVERSION } from '../../version';

export type SaveHistoryResponse = SuccessResponse<{ message: string }> | FailureResponse;

export const saveHistory = async (fileName: string, code: string, generation?: number): Promise<SaveHistoryResponse> => {

    if (!validEmailSession()) {
        return failureResponse('Seems like your session expired, try logging in again');
    }

    const url = getUrl('savehistory');

    const userEmail = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    const data = {
        userEmail: userEmail,
        sessionId: sessionId,
        snapshot: {
            fileName: fileName,
            code: code,
            generation: generation
        },
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

        const jsonResponse = await response.json(); // get json response\
        // tslint:disable-next-line:no-console
        // console.log(jsonResponse);

        if (jsonResponse.status === 'error') {
            return failureResponse('Something went wrong, try refreshing the page');
        }

        if (jsonResponse.status === 'failure') {
            return failureResponse(jsonResponse.message); // quite inconsistent actually
            // I have message as its own field in the response but for my response
            // for the frontend, I always have a data field that contains either message, or...data
        }

        // be sure to open this list (set state to open)
        return successResponse<{ message: string }>({
            message: 'History saved'
        });

    } catch (error) {
        // Stop loading the file (set state to not loading)
        return failureResponse(
            'Couldn\'t connect to the server at the moment, try again later'
        );
    }
};