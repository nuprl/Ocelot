// BEING USED IN A SAGA at store/userLogin/

import { GoogleLoginResponse } from 'react-google-login';

interface SuccessResponse {
    status: 'SUCCESS';
    data: { email: string };
}

interface FailureResponse {
    status: 'FAILURE';
    data: { message: string };
}

export type validateUserResponse = SuccessResponse | FailureResponse;

export const isFailureResponse = (arg: validateUserResponse): arg is FailureResponse => arg.status === 'FAILURE';

export async function validateUser(googleUser: GoogleLoginResponse): Promise<validateUserResponse> {
    const email = googleUser.getBasicProfile().getEmail();

    const id_token = googleUser.getAuthResponse().id_token; // get id token
    let url = 'https://us-central1-umass-compsci220.cloudfunctions.net/paws/login';
    // domain to send post requests to

    if (window.location.host.substring(0, 9) === 'localhost') { // if hosted on localhost
        url = 'http://localhost:8000/login';
    }

    let data: { token: string, sessionId: string | null } = { token: id_token, sessionId: null }; // data to be sent

    const possibleSessionId = localStorage.getItem('sessionId');
    if (possibleSessionId !== null) {
        data.sessionId = possibleSessionId;
    }

    try {
        const response = await fetch(url, { // send json data to specified URL
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const jsonResponse = await response.json(); // get json response
        if (response.status !== 200 || jsonResponse.message === 'Unauthorized') {
            // if messaged back as unauthorized
            googleUser.disconnect(); // sign user out (revoke given permissions)
            return {
                status: 'FAILURE',
                data: {
                    message: 'Only students and professors of CS 220 are allowed to log in'
                }
            };
        }

        // important: the key here is 'sessionId'
        localStorage.setItem('sessionId', jsonResponse.data.sessionId);
        localStorage.setItem('userEmail', googleUser.getBasicProfile().getEmail());

        return {
            status: 'SUCCESS',
            data: {
                email: email,
            }
        };

    } catch (error) {
        googleUser.disconnect();
        return {
            status: 'FAILURE',
            data: {
                message: 'The authentication server seems to be down. Try again in a bit.'
            }
        };
    }
}