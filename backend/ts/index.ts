
import * as Storage from '@google-cloud/storage'; // Google cloud storage
import * as Datastore from '@google-cloud/datastore';
import { OAuth2Client } from 'google-auth-library'; // for authenticating google login
import { Request } from 'express'; // For response and request object autocomplete
import * as express from 'express'; // for routing different links
import * as bodyParser from 'body-parser'; // for parsing JSON data
import * as path from 'path'; // for manipulating paths
import * as cors from 'cors'; // allows sending http requests to different domains
import * as uid from 'uid-safe';
import * as morgan from 'morgan'; // for logging in all http traffic on console.

const storage = Storage();
const bucket = storage.bucket('paws-student-files');

const datastore = new Datastore({});
const datastoreKind = 'CS220AllowedAccounts';

const sessionDuration = 3; // hours

function isWithinSessionTime(sessionTime: number) {
  const sessionDurationMili: number = sessionDuration * 3600000;
  if (Math.abs(sessionTime - Date.now()) > sessionDurationMili) {
    return false;
  }
  return true;
}

async function checkValidSession(userEmail: string, sessionId: string): Promise<boolean> {
  const key = datastore.key([datastoreKind, userEmail, 'session', sessionId]);
  // kind: session, name is a sessionId
  const query = datastore.createQuery('session').filter('__key__', '=', key);
  const [results] = await datastore.runQuery(query);
  if (results.length === 1 && isWithinSessionTime((results[0] as any).time)) {
    await updateSessionId(userEmail, sessionId);
    return true;
  }
  return false;
}

async function checkValidUser(userEmail: string): Promise<boolean> {
  const query = datastore
    .createQuery(datastoreKind)
    .filter('__key__', '=', datastore.key([datastoreKind, userEmail]));

  const [results] = await datastore.runQuery(query);
  if (results.length === 1) {
    return true;
  }
  return false;
}

async function updateSessionId(userEmail: string, sessionId: string): Promise<void> {
  const sessionEntityKey = datastore.key([datastoreKind, userEmail, 'session', sessionId]);
  const session = {
    key: sessionEntityKey,
    data: {
      time: Date.now()
    }
  }
  await datastore.upsert(session);

}

/**
 * Given the userEmail in req, get files of user accordingly
 * Otherwise, return unauthorized message if user is not authorized.
 * 
 * @param {Request} req with a userEmail attribute from JSON POST request
 * @returns statusCode and contents in body
 */
async function getUserFiles(req: Request) {
  // Get sessionId from JSON
  const sessionId = req.body.sessionId;
  // Get user attribute 
  const userEmail = req.body.userEmail;
  // check against database for sessionId
  const isValidSession: boolean = await checkValidSession(userEmail, sessionId);

  if (!isValidSession) {
    return {
      statusCode: 200,
      body:
        {
          status: 'failure',
          message: 'Invalid session'
        }
    };
  }

  try {
    // specifiying the prefix of the directory to list files
    const prefixAndDelimiter = {
      delimiter: '/',
      prefix: userEmail.split('@')[0] + '/'
    }; // delimiter makes it so that we get only the direct child of prefix

    const [files] = await bucket.getFiles(prefixAndDelimiter);
    // get files for folder
    let userFiles: { user: string, files: { name: string, content: string }[] };
    userFiles = { user: userEmail, files: [] };

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

    return {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          userFiles: userFiles
        }
      }
    };

  } catch (e) {

    return { statusCode: 500, body: { status: 'failure', message: e } };
  }

}

const CLIENT_ID = '883053712992-bp84lpgqrdgceasrhvl80m1qi8v2tqe9.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

/**
 * Verifies the given token in request
 * and check if user is allowed to be sign in.
 * 
 * @param {Request} req 
 * @returns statusCode and contents in body
 */
async function login(req: Request) {

  // check if user has active session, if so, just return session

  const ticket = await client.verifyIdToken({ // verify and get ticket
    idToken: req.body.token,
    audience: CLIENT_ID
  });

  if (ticket == null) {
    return { statusCode: 400, body: { status: 'error', message: 'verifying ends up null hm' } };
  }

  const payload = ticket.getPayload(); // get payload from ticket
  if (payload == null) {
    return { statusCode: 400, body: { status: 'error', message: 'payload ends up null hm' } };
  }

  const userEmail = payload['email']; // get user email
  if (userEmail == undefined) {
    return { statusCode: 400, body: { status: 'error', message: 'No email' } };
  }

  const isValidUser: boolean = await checkValidUser(userEmail);
  if (!isValidUser) {
    return { statusCode: 200, body: { status: 'failure', 'message': 'Unauthorized' } };
  }
  // at this point the user is CS220 student/teacher of some sort.

  let sessionId: string | null = req.body.sessionId // explicit null is passed into sessionId if it's not there
  if (sessionId === null) {
    sessionId = uid.sync(18);
  }

  const sessionEntityKey = datastore.key([datastoreKind, userEmail, 'session', sessionId])

  await datastore.upsert({
    key: sessionEntityKey,
    data: {
      time: Date.now()
    }
  });

  return {
    statusCode: 200,
    body: {
      status: 'success',
      data: {
        sessionId: sessionId,
      }
    }
  };
}

// for testing stuff
async function testDatastore() {

  const kind = 'CS220AllowedAccounts';
  const users = ['chunghinlee', 'arjunguha', 'rachitnigam', 'sambaxter'];
  const emailDomain = 'umass.edu'
  for (let i = 0; i < users.length; i++) {
    const userKey = datastore.key([kind, users[i] + '@' + emailDomain]);
    const userEntity = {
      key: userKey,
      data: {
        email: users[i] + '@' + emailDomain
      }
    };

    try {
      await datastore.save(userEntity);
      console.log(`Saved ${userEntity.key.name}: ${userEntity.data.email}`);
    } catch (err) {
      console.error('ERROR:', err);
    }
  }




}





export const paws = express();
paws.use(morgan('combined')); // logging all http traffic

paws.use(cors()); // shouldn't this have options for which domain to allow? (will be dealt later)
// allows cross-origin resource sharing, i.e stops Same Origin Policy from 
// happening across different ports, we need to do this to send post requests
// (Same Origin Policy is on by default to prevent cross site resource forgery)

paws.use(bodyParser.json()); // parse all incoming json data

paws.get('/', (req, res) => { // simple get request
  res.status(200).send('Hello World');
});

paws.post('/getfile', (req, res) => { // post request to route /getfile
  getUserFiles(req).then(responseObj => { // give req to getUserFiles and process it accordingly
    res.status(responseObj.statusCode).json(responseObj.body);
  }).catch(reason => { // for debugging
    res.status(500).send(reason.toString());
  });
});

paws.post('/login', (req, res) => { // post request to login to verify token
  login(req).then(responseObj => {
    res.status(responseObj.statusCode).json(responseObj.body);
  }).catch(reason => {
    res.status(500).send(reason.toString());
  });
});

// testing datastore
paws.get('/testo', (req, res) => {
  testDatastore().then(() => {
    res.status(200).send('Hello World!!');
  }).catch(reason => {
    res.status(500).send(reason.toString);
  });
});
