import { 
    failureResponse, 
    successResponse,
    validEmailSession, 
    FailureResponse,
    getUrl,
    SuccessResponse
 } from './apiHelpers';
import * as state from '../../state';

import { EJSVERSION } from 'elementary-js/dist/version';
import { OCELOTVERSION } from '../../version';

type UserFile = { name: string, content: string };

export type UserFilesResponse = SuccessResponse<{userFiles: UserFile[]}> | FailureResponse;

export const getUserFiles = async (): Promise<UserFilesResponse> => {

    // This function should be called in a SAGA right after logging in
    // BE SURE TO SET LOADING BEFORE CALLING THIS FUNCTION

    if (!validEmailSession()) {
        return failureResponse('Seems like your session expired, try logging in again');
    }

    const url = getUrl('getfile');

    const userEmail = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');

    if (userEmail === null) {
        return failureResponse(`userEmail was not in Local Storage`);
    }

    const data = { userEmail: userEmail,
        sessionId: sessionId, 
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
        // Be sure to set not loading after this function

        if (jsonResponse.status === 'error') {
            return failureResponse('Something went wrong, try refreshing the page');
        }

        if (jsonResponse.status === 'failure') {
            return failureResponse('Your session expired, try refreshing the page');
        }


        state.loggedIn.next({ kind: 'logged-in', email: userEmail });

        // be sure to open this list (set state to open)
        return successResponse<{userFiles: UserFile[]}>({
            userFiles: jsonResponse.data.userFiles
        });

    } catch (error) {
        // Stop loading the file (set state to not loading)
        return failureResponse(
            'Couldn\'t connect to the server at the moment, try again later'
        );
    }
};