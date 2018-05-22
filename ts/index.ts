
import * as storage from '@google-cloud/storage';
import {OAuth2Client} from 'google-auth-library';
import {Request} from 'express';

const sto = storage(); //why not new?
const bucket = sto.bucket('paws-student-files');

async function getUserFiles(req: Request) {
  // Check to see if request is a get request
  if (req.method !== 'POST') {
    return {statusCode: 200, body: 'Testopesto'};
  }

  // Check to see if request is a json file
  if (req.get('content-type') !== 'application/json') {
    return {statusCode: 400, body: JSON.stringify({"message": "Not JSON"})}
  }
  // Get user attribute 
  const currentUser : string = req.body.user;

  // Get allowed users list
  const [file] = await bucket.file('allowedUsersList.json').get();
  const [buffer] =  await file.download();
  const usersArray: string[] = JSON.parse(buffer.toString());

  // if current user is not allowed
  if (!usersArray.includes(currentUser)) { 
    return {statusCode: 401, body: JSON.stringify({"message": "Unauthorized"})};
  }

  try {
    // specifiying the prefix of the directory to list files
    const prefixAndDelimiter = {
      delimiter: '/',
      prefix: currentUser + '/'
    }; // delimiter makes it so that we get only the direct child of prefix

    const [files] = await bucket.getFiles(prefixAndDelimiter);
    // get files for folder
    let userFiles: {user: string, files: {name: string, content: string}[]};
    userFiles = {user: currentUser, files: []};

    for (let i = 0; i < files.length; i++) { // loop through all files
      const [fileContents] = await files[i].download();
      userFiles.files.push({
        name: files[i].name,
        content: fileContents.toString()
      });
    }

    return {statusCode: 200, body: JSON.stringify(userFiles)};

  } catch (e) {

    return {statusCode: 500, body: e}
  }

}



export function pawsGetFile(req: any, res: any) {
  getUserFiles(req).then(responseObj => {
    res.status(responseObj.statusCode).send(responseObj.body);
  });
}

export function pawsLoginAuthenticate(req: any, res: any) {
  //filler
  res.status(200).end();
}