import {
    failureResponse,
    successResponse,
    validEmailSession,
    FailureResponse,
    getUrl,
    SuccessResponse
} from './apiHelpers';

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

    const data = { userEmail: userEmail, sessionId: sessionId, fileName: fileName };

    try {
        const response = await fetch(url, { // send json data to specified URL
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const jsonResponse = await response.json(); // get json response
        // tslint:disable-next-line:no-console
        console.log(jsonResponse);

        if (jsonResponse.status === 'error') {
            return failureResponse('Something went wrong, try refreshing the page');
        }

        if (jsonResponse.status === 'failure') {
            return failureResponse('Your session expired, try refreshing the page');
        }

        // be sure to open this list (set state to open)
        return successResponse<{ history: FileHistory[] }>({
            history: jsonResponse.data.history
        });

    } catch (error) {
        // Stop loading the file (set state to not loading)
        // tslint:disable-next-line:no-console
        return failureResponse(
            'Couldn\'t connect to the server at the moment, try again later'
        );
    }
};