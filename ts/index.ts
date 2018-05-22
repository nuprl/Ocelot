
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
    return {statusCode: 400, body: 'Not JSON\n'}
  }
  // Get user attribute 
  const currentUser : string = req.body.user;

  // Get allowed users list
  const [file] = await bucket.file('allowedUsersList.json').get();
  const [buffer] =  await file.download();
  const usersArray: string[] = JSON.parse(buffer.toString());

  // if current user is not allowed
  if (!usersArray.includes(currentUser)) { 
    return {statusCode: 401, body: 'Unauthorized\n'};
  }

  try {
    // specifiying the prefix of the directory to list files
    const prefixAndDelimiter = {
      delimiter: '/',
      prefix: currentUser + '/'
    }; // delimiter makes it so that we get only the direct child of prefix

    const [files] = await bucket.getFiles(prefixAndDelimiter);
    // get files for folder
    let bodyString: string = currentUser + "'s files:\n";

    for (let i = 0; i < files.length; i++) { // loop through all files
      bodyString += 'Name: ' + files[i].name + '\n';
      bodyString += 'Contents:\n'
      const [fileContents] = await files[i].download();
      // download file
      bodyString += fileContents.toString() + '\n';
      // put file content in body text.
    }

    return {statusCode: 200, body: bodyString};

  } catch (e) {

    return {statusCode: 500, body: e}
  }

}

export function paws(req: any, res: any) {
  pawsMain(req).then(pawsResponse => {
    res.status(pawsResponse.statusCode).send(pawsResponse.body);
  });
}