
import * as Storage from '@google-cloud/storage'; // Google cloud storage
import * as Datastore from '@google-cloud/datastore';
import { OAuth2Client } from 'google-auth-library'; // for authenticating google login
import { Request } from 'express'; // For response and request object autocomplete
import * as express from 'express'; // for routing different links
import * as bodyParser from 'body-parser'; // for parsing JSON data
import * as path from 'path'; // for manipulating paths
import * as cors from 'cors'; // allows sending http requests to different domains

import * as morgan from 'morgan'; // for logging in all http traffic on console.
import { PassThrough } from 'stream';

const storage = Storage();
const bucket = storage.bucket('paws-student-files');

const projectId = 'umass-compsci220'
const datastore = new Datastore({
  projectId: projectId // should I include the project id? or should I remove it?
});


/**
 * Given the username in req, get files of user accordingly
 * Otherwise, return unauthorized message if user is not authorized.
 * 
 * @param {Request} req with a user attribute from JSON POST request
 * @returns statusCode and contents in body
 */
async function getUserFiles(req: Request) {

  // Get user attribute 
  const currentUser: string = req.body.user;

  // Get allowed users list from Datastore, a list of emails
  const kind = 'CS220AllowedUsers';
  const name = 'allowedUsers';
  const query = datastore
    .createQuery(kind)
    .filter('__key__', '=', datastore.key([kind, name]));

  const [result] = await datastore.runQuery(query);
  const userObj = result[0] as any;

  const usersArray: string[] = userObj.users

  // if current user is not allowed
  if (!usersArray.includes(currentUser)) {
    return { statusCode: 401, body: { "message": "Unauthorized" } };
  }

  try {
    // specifiying the prefix of the directory to list files
    const prefixAndDelimiter = {
      delimiter: '/',
      prefix: currentUser.split('@')[0] + '/'
    }; // delimiter makes it so that we get only the direct child of prefix

    const [files] = await bucket.getFiles(prefixAndDelimiter);
    // get files for folder
    let userFiles: { user: string, files: { name: string, content: string }[] };
    userFiles = { user: currentUser, files: [] };

    for (let i = 0; i < files.length; i++) { // loop through all files
      const [fileContents] = await files[i].download();
      const fileName: string = files[i].name;

      if (fileName.substr(fileName.length - 1, 1) !== '/') { // if it's not directory directory
        userFiles.files.push({
          name: path.basename(files[i].name), // get the filename instead of whole path
          content: fileContents.toString()
        });
      }
    }

    return { statusCode: 200, body: userFiles };

  } catch (e) {

    return { statusCode: 500, body: { message: e } };
  }

}


const CLIENT_ID = "883053712992-bp84lpgqrdgceasrhvl80m1qi8v2tqe9.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

/**
 * Verifies the given token in request
 * and check if user is allowed to be sign in.
 * 
 * @param {Request} req 
 * @returns statusCode and contents in body
 */
async function verify(req: Request) {

  const ticket = await client.verifyIdToken({ // verify and get ticket
    idToken: req.body.token,
    audience: CLIENT_ID
  });

  if (ticket == null) {
    return { statusCode: 400, body: { message: "verifying ends up null hm" } };
  }

  const payload = ticket.getPayload(); // get payload from ticket

  if (payload == null) {
    return { statusCode: 400, body: { message: "payload ends up null hm" } };
  }

  const userEmail = payload['email']; // get user email

  if (userEmail == undefined) {
    return { statusCode: 400, body: { message: "No email" } };
  }

  // Get allowed users list, not sure how to fix this duplicated code
  const [file] = await bucket.file('allowedUsersList.json').get();
  const [buffer] = await file.download();
  const usersArray: string[] = JSON.parse(buffer.toString());

  if (!usersArray.includes(userEmail)) { // check if logged in user is allowed
    return { statusCode: 401, body: { "message": "Unauthorized" } };
  }

  return { statusCode: 200, body: { "message": "Success" } }

}



async function testDatastore() {

  // const taskKey = datastore.key([kind, name]);

  // const task = {
  //   key: taskKey,
  //   data: {
  //     users: [
  //       "chunghinlee@umass.edu",
  //       "arjunguha@umass.edu",
  //       "rachitnigam@umass.edu",
  //       "sambaxter@umass.edu"
  //     ]
  //   }
  // }



}





export const paws = express();
paws.use(morgan('combined')); // logging all http traffic

paws.use(cors()); // shouldn't this have options for which domain to allow? (will be dealt later)
// allows cross-origin resource sharing, i.e stops Same Origin Policy from 
// happening across different ports, we need to do this to send post requests
// (Same Origin Policy is on by default to prevent cross site resource forgery)

paws.use(bodyParser.json()); // parse all incoming json data

paws.get('/', (req, res) => { // simple get request
  res.status(200).send("Hello World");
});

paws.post('/getfile', (req, res) => { // post request to route /getfile
  getUserFiles(req).then(responseObj => { // give req to getUserFiles and process it accordingly
    res.status(responseObj.statusCode).json(responseObj.body);
  }).catch(reason => { // for debugging
    res.status(500).send(reason.toString());
  });
});

paws.post('/login', (req, res) => { // post request to login to verify token
  verify(req).then(responseObj => {
    res.status(responseObj.statusCode).json(responseObj.body);
  }).catch(reason => {
    res.status(500).send(reason.toString());
  });
});

// testing datastore
paws.get('/testo', (req, res) => {
  testDatastore().then(() => {
    res.status(200).send("Hello World!!");
  }).catch(reason => {
    res.status(500).send(reason.toString);
  });
});
