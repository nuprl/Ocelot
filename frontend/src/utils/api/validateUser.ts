// BEING USED IN A SAGA at store/userLogin/

import { GoogleLoginResponse } from 'react-google-login';
import { FailureResponse, getUrl, SuccessResponse, failureResponse, successResponse } from './apiHelpers';

import { EJSVERSION } from 'elementary-js/dist/version';
import { OCELOTVERSION } from '../../version';

export type validateUserResponse = SuccessResponse<{ email: string }> | FailureResponse;

export async function validateUser(googleUser: GoogleLoginResponse): Promise<validateUserResponse> {
    const email = googleUser.getBasicProfile().getEmail();

    const id_token = googleUser.getAuthResponse().id_token; // get id token
    
    const url = getUrl('login');

    let data: { token: string, sessionId: string | null, ejsVersion: string, ocelotVersion: string } = { 
        token: id_token, sessionId: null, 
        ejsVersion: EJSVERSION,
        ocelotVersion: OCELOTVERSION 
    }; // data to be sent

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
            return failureResponse('Only students and professors of CS 220 are allowed to log in');
        }

        // important: the key here is 'sessionId'
        localStorage.setItem('sessionId', jsonResponse.data.sessionId);
        localStorage.setItem('userEmail', googleUser.getBasicProfile().getEmail());

        return successResponse<{email: string}>({email: email});

    } catch (error) {
        googleUser.disconnect();
        return failureResponse('The authentication server seems to be down. Try again in a bit.');
    }
}