
import * as storage from '@google-cloud/storage';

const sto = storage();
const bucket = sto.bucket('paws-student-files');

async function pawsMain(req: any) {

  // Check to see if request is a get request
  if (req.method !== 'POST') {
    return {statusCode: 200, body: 'Testopesto'};
  }

  // Check to see if request is a json file
  if (req.get('content-type') !== 'application/json') {
    return {statusCode: 400, body: 'Not JSON'}
  }
  // Get user attribute 
  const currentUser : string = req.body.user;

  // Get allowed users list
  const [file] = await bucket.file('allowedUsersList.json').get();
  const [buffer] =  await file.download();
  const usersArray: string[] = JSON.parse(buffer.toString());

  // if current user is not allowed
  if (!usersArray.includes(currentUser)) { 
    return {statusCode: 401, body: 'Unauthorized'};
  }

  try {
    // specifiying the prefix of the directory to list files
    const prefixAndDelimiter = {
      prefix: '/' + currentUser,
      delimiter: '/'
    }; // e.g. if currentUser is samlee, it ends up : /samlee/
    
    const [filesList] = await bucket.getFiles(prefixAndDelimiter);
    let bodyString: string = currentUser + "'s files:\n";
    filesList.forEach(fileName => {
      bodyString += fileName + "\n";
    });

    return {statusCode: 200, body: bodyString};

  } catch (e) {

    return {statusCode: 500, body: 'User does not have stored folder.'}
  }

}

export function paws(req: any, res: any) {
  pawsMain(req).then(pawsResponse => {
    res.status(pawsResponse.statusCode).send(pawsResponse.body);
  });
}