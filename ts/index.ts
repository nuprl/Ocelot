
import * as storage from '@google-cloud/storage'; // Google cloud storage
import {OAuth2Client} from 'google-auth-library'; // for authenticating google login
import {Request} from 'express'; // For response and request object autocomplete
import * as express from 'express'; // for routing different links
import * as bodyParser from 'body-parser'; // for parsing JSON data
import * as path from 'path'; // for manipulating paths
import * as cors from 'cors';

import * as morgan from 'morgan'; // for logging in all http traffic on console.

const sto = storage();
const bucket = sto.bucket('paws-student-files');

async function getUserFiles(req: Request) {
  // Check to see if request is a get request
  if (req.method !== 'POST') {
    return {statusCode: 200, body: 'TEST'};
  }

  // Check to see if request is a json file
  if (req.get('content-type') !== 'application/json') {
    return {statusCode: 400, body: {"message": "Not JSON"}}
  }
  // Get user attribute 
  const currentUser : string = req.body.user;

  // Get allowed users list, a list of emails
  const [file] = await bucket.file('allowedUsersList.json').get();
  const [buffer] =  await file.download();
  const usersArray: string[] = JSON.parse(buffer.toString());

  // if current user is not allowed
  if (!usersArray.includes(currentUser)) { 
    return {statusCode: 401, body: {"message": "Unauthorized"}};
  }

  try {
    // specifiying the prefix of the directory to list files
    const prefixAndDelimiter = {
      delimiter: '/',
      prefix: currentUser.split('@')[0] + '/'
    }; // delimiter makes it so that we get only the direct child of prefix

    const [files] = await bucket.getFiles(prefixAndDelimiter);
    // get files for folder
    let userFiles: {user: string, files: {name: string, content: string}[]};
    userFiles = {user: currentUser, files: []};

    for (let i = 0; i < files.length; i++) { // loop through all files
      const [fileContents] = await files[i].download();
      userFiles.files.push({
        name: path.basename(files[i].name), // get the filename instead of whole path
        content: fileContents.toString()
      });
    }

    return {statusCode: 200, body: userFiles};

  } catch (e) {

    return {statusCode: 500, body: {message: e}};
  }

}


const CLIENT_ID = "883053712992-bp84lpgqrdgceasrhvl80m1qi8v2tqe9.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

async function verify(req: Request) {
  const ticket = await client.verifyIdToken({
    idToken: req.body.token,
    audience: CLIENT_ID
  });

  if (ticket == null) {
    return {statusCode: 400, body: {message: "verifying ends up null hm"}};
  }

  const payload = ticket.getPayload();

  if (payload == null) {
    return {statusCode: 400, body: {message: "payload ends up null hm"}};
  }

  const userEmail = payload['email'];
  
  if (userEmail == undefined) {
    return {statusCode: 400, body: {message: "No email"}};
  }

  // Get allowed users list, not sure how to fix this duplicated code
  const [file] = await bucket.file('allowedUsersList.json').get();
  const [buffer] =  await file.download();
  const usersArray: string[] = JSON.parse(buffer.toString());

  if (!usersArray.includes(userEmail)) { 
    return {statusCode: 401, body: {"message": "Unauthorized"}};
  }

  return {statusCode: 200, body: {"message": "Success"}}

}




export const paws = express();
paws.use(morgan('combined')); // logging all http traffic

paws.use(cors()); // shouldn't be on one single route?
// allows cross-origin resource sharing, i.e stops Same Origin Policy from 
// happening across different ports, we need to this to send post requests
// (Same Origin Policy is on by default to prevent cross site resource forgery)

paws.use(bodyParser.json()); // parse all incoming json data

paws.get('/', (req, res) => {
  res.status(200).send("Hello World");
});

paws.post('/getfile', (req, res) => {
  getUserFiles(req).then(responseObj => {
    res.status(responseObj.statusCode).json(responseObj.body);
  }).catch(reason => { // for debugging
    res.status(500).send(reason.toString());
  });
});

paws.post('/login', (req, res) => {
  verify(req).then(responseObj => {
    res.status(responseObj.statusCode).json(responseObj.body);
  }).catch(reason => {
    res.status(500).send(reason.toString());
  });
});