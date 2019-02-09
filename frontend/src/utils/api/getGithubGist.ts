import {
  failureResponse,
  successResponse,
  SuccessResponse,
  FailureResponse
} from './apiHelpers';

import { console as logError } from '../../errors';

export type GithubGistResponse = SuccessResponse<{ code: string }> | FailureResponse;

export const getGithubGist = async (gistID: string): Promise<GithubGistResponse> => {

  try {
    const response = await fetch(`https://gist.githubusercontent.com/${gistID}/raw`);

    if (response.status !== 200) {
      return failureResponse('Cannot fetch gist');
    }

    return successResponse({
      code: await response.text()
    });

  } catch (error) {
    logError.log(error);
    return failureResponse('Error fetching gist');
  }
};