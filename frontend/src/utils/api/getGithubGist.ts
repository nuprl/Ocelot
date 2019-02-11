import {
  failureResponse,
  successResponse,
  SuccessResponse,
  FailureResponse
} from './apiHelpers';

export type GithubGistResponse = SuccessResponse<{ code: string }> | FailureResponse;

export const getGithubGist = async (gistID: string): Promise<GithubGistResponse> => {

  try {
    const response = await fetch(`https://gist.githubusercontent.com/${gistID}/raw`);

    if (response.status !== 200) {
      return failureResponse('Cannot load Github gist');
    }

    return successResponse({
      code: await response.text()
    });

  } catch (error) {
    return failureResponse('Error loading Github gist');
  }
};