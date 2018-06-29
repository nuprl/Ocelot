
type UserFile = { name: string, content: string };

interface SuccessResponse {
    status: 'SUCCCESS',
    data: { userFiles: UserFile[] }
}

interface FailureResponse {
    status: 'FAILURE',
    data: { message: string },
}

export type UserFilesResponse = SuccessResponse | FailureResponse;

const failureResponse = (message: string): FailureResponse => ({
    status: 'FAILURE',
    data: { message: message }
});

const successResponse = (userFiles: UserFile[]): SuccessResponse => ({
    status: 'SUCCCESS',
    data: { userFiles: userFiles }
});

export const getUserFiles = async (): Promise<UserFilesResponse> => {
    // This function should be called in a SAGA right after logging in
    // BE SURE TO SET LOADING BEFORE CALLING THIS FUNCTION

    const userEmail = localStorage.getItem('userEmail');
    const sessionId = localStorage.getItem('sessionId');
    if (userEmail !== null && sessionId !== null) {
        return failureResponse('Seems like your session expired, try logging in again');
    }
    let url = 'https://us-central1-umass-compsci220.cloudfunctions.net/paws/getfile';
    // domain to send post requests to

    if (window.location.host.substring(0, 9) === 'localhost') { // if hosted on localhost
        url = 'http://localhost:8000/getfile';
    }

    const data = { userEmail: userEmail, sessionId: sessionId };

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

        // be sure to open this list (set state to open)
        return successResponse(jsonResponse.data.userFiles);

    } catch (error) {
        // Stop loading the file (set state to not loading)
        return failureResponse(
            'Couldn\'t connect to the server at the moment, try again later'
        );
    }
};