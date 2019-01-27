import {
    failureResponse,
    successResponse,
    validEmailSession,
    FailureResponse,
    getUrl,
    SuccessResponse
} from './apiHelpers';

import { EJSVERSION } from '@stopify/elementary-js/dist/version';
import { OCELOTVERSION } from '../../version';

export type FileHistory = {
    generation: number,
    dateCreated: string,
    timeCreated: string,
    code: string,
};

export type FileHistoryResponse = SuccessResponse<{ history: FileHistory[] }> | FailureResponse;

export const getFileHistory = async (fileName: string): Promise<FileHistoryResponse> => {
    // This function should be called in a SAGA right after logging in
    // BE SURE TO SET LOADING BEFORE CALLING THIS FUNCTION

    if (!validEmailSession()) {
        return failureResponse('Seems like your session expired, try logging in again');
    }

    const url = getUrl('gethistory');

    const userEmail = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    const data = { 
        userEmail: userEmail, 
        sessionId: sessionId, 
        fileName: fileName,
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

        const jsonResponse = await response.json(); // get json response

        if (jsonResponse.status === 'error') {
            return failureResponse('Something went wrong, try refreshing the page');
        }

        if (jsonResponse.status === 'failure') {
            return failureResponse(jsonResponse.message); // quite inconsistent actually
            // I have message as its own field in the response but for my response
            // for the frontend, I always have a data field that contains either message, or...data
        }
        const history: FileHistory[] = jsonResponse.data.history;
        history.map((elem) => {
            const dateTime = new Date(
                elem.dateCreated + ' ' + elem.timeCreated + ' UTC');
            elem.dateCreated = dateTime.toLocaleDateString('en-US');
            elem.timeCreated = dateTime.toLocaleTimeString('en-US');
        });

        const reversedHistory = history.map((elem, index) => history[history.length - 1 - index]);

        // be sure to open this list (set state to open)
        return successResponse<{ history: FileHistory[] }>({
            history: reversedHistory
        });

    } catch (error) {
        // Stop loading the file (set state to not loading)
        // tslint:disable-next-line:no-console
        return failureResponse(
            'Couldn\'t connect to the server at the moment, try again later'
        );
    }
};