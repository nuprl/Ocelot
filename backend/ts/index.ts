
import * as Storage from '@google-cloud/storage'; // Google cloud storage
import * as Datastore from '@google-cloud/datastore';
import { OAuth2Client } from 'google-auth-library'; // for authenticating google login
import { Request, Response } from 'express'; // For response and request object autocomplete
import * as express from 'express'; // for routing different links
import * as bodyParser from 'body-parser'; // for parsing JSON data
import * as path from 'path'; // for manipulating paths
import * as cors from 'cors'; // allows sending http requests to different domains
import * as uid from 'uid-safe';
import * as morgan from 'morgan'; // for logging in all http traffic on console.

const storage = Storage();
const fileBucket = storage.bucket('ocelot-student-files');
const settingsBucket = storage.bucket('plasma-settings');
const historyBucket = storage.bucket('ocelot-student-history');

const datastore = new Datastore({});
const datastoreKind = 'CS220AllowedAccounts';

let client: OAuth2Client | undefined = undefined;
let CLIENT_ID: string | undefined = undefined;

let sessionDuration: number | undefined = undefined; // hours
type Settings = { clientID: string, sessionDuration: number };
let settings: Settings | undefined = undefined;

let verbose: boolean = true;
let miliTimes: number[] = [];

// IMPORTANT: Should I wrap all function bodies in try catch just in case?

function timePromise<T>(promise: Promise<T>) {
  const now = Date.now();
  return promise.then((data: T) => {
    const timeElapsed = Date.now() - now;
    verbose && console.log(`\t\tMiliseconds: ${timeElapsed}`);
    verbose && miliTimes.push(timeElapsed);
    return data;
  })
}

async function getSettings() {
  if (settings !== undefined) {
    return settings;
  }
  verbose && console.log('\tGetting settings.json');
  const settingsFile = await timePromise(settingsBucket.file('ocelot-settings.json').download());
  settings = JSON.parse(settingsFile.toString());
  return settings;
}

async function getClientID() {
  if (CLIENT_ID !== undefined) {
    return CLIENT_ID;
  }
  CLIENT_ID = ((await getSettings()) as Settings).clientID;
  return CLIENT_ID;
}

async function getOAuthClient() {
  if (client !== undefined) {
    return client;
  }
  const clientID = (await getClientID());
  client = new OAuth2Client(clientID);
  return client;
}

async function getSessionDuration() {
  if (sessionDuration !== undefined) {
    return sessionDuration;
  }
  sessionDuration = ((await getSettings()) as Settings).sessionDuration;
  return sessionDuration;
}


function undefinedExists(...properties: (any | undefined)[]) {
  function hasUndefined(acc: boolean, val: (any | undefined)) {
    return acc || typeof val === 'undefined';
  }
  return properties.reduce(hasUndefined, false);
}


function failureResponse(message: string) {
  return {
    statusCode: 200,
    body: {
      status: 'failure',
      message: message
    }
  }
}

async function isWithinSessionTime(sessionTime: number) {
  const sessionDurationMili: number = (await getSessionDuration()) * 3600000;
  if (Math.abs(sessionTime - Date.now()) > sessionDurationMili) {
    return false;
  }
  return true;
}

async function checkValidSession(userEmail: string, sessionId: string): Promise<boolean> {
  const key = datastore.key([datastoreKind, userEmail, 'session', sessionId]);
  // kind: session, name is a sessionId
  const query = datastore.createQuery('session').filter('__key__', '=', key);
  verbose && console.log('\tQuerying valid session');
  const [results] = await timePromise(datastore.runQuery(query));
  if (results.length === 1 && isWithinSessionTime((results[0] as any).time)) {
    verbose && console.log('\tUpdating session id');
    await timePromise(updateSessionId(userEmail, sessionId));
    return true;
  }
  return false;
}

async function checkValidUser(userEmail: string): Promise<boolean> {
  const query = datastore
    .createQuery(datastoreKind)
    .filter('__key__', '=', datastore.key([datastoreKind, userEmail]));
  verbose && console.log('\tQuerying valid user');
  const [results] = await timePromise(datastore.runQuery(query));
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

async function getArrayOfFiles(userEmail: string): Promise<Storage.File[]> {
  // specifiying the prefix of the directory to list files
  const prefixAndDelimiter = {
    delimiter: '/',
    prefix: userEmail + '/'
  }; // delimiter makes it so that we get only the direct child of prefix
  verbose && console.log('\tQuerying list of files');
  const [files] = await timePromise(fileBucket.getFiles(prefixAndDelimiter));
  // get files for folder

  return files;
}

function isSimpleValidEmail(email: string) { // incomplete but will do for now
  return /^\w[.\w]*@\w+\.[a-zA-Z]+$/.test(email);
}

function isSimpleValidFileName(fileName: string) { // still incomplete but will do for now
  return /^\w+\.\w+/.test(fileName);
}

/**
 * Check if objects of a file request is valid
 * Expects first argument to be useremail and second argument to be sessionid
 * returns a Failure Response if it's not, otherwise
 * it returns an object with a body and its status 'ok'
 *
 * @param {...any[]} args
 * @returns a failure restponse or an object with a body with status okay.
 */
async function checkValidFileRequest(userEmail: string, sessionId: string, ...args: any[]) {

  if (undefinedExists(userEmail, sessionId, ...args)) {
    return { isFailure: true, message: 'Incomplete request' };
  }
  // check against database for sessionId
  const isValidSession: boolean = await checkValidSession(userEmail, sessionId);
  if (!isValidSession) {
    return { isFailure: true, message: 'Invalid session' };
  }
  if (!isSimpleValidEmail(userEmail)) {
    return { isFailure: true, message: 'Invalid email' };
  }

  return { isFailure: false, message: 'ok' };
}

/**
 * Given the userEmail in req, get files of user accordingly
 * Otherwise, return unauthorized message if user is not authorized.
 * 
 * @param {Request} req with a userEmail attribute from JSON POST request
 * @returns statusCode and contents in body
 */
async function getFile(req: Request) {
  const valid = await checkValidFileRequest(req.body.userEmail, req.body.sessionId);
  if (valid.isFailure) {
    return failureResponse(valid.message);
  }

  try {
    const files = await getArrayOfFiles(req.body.userEmail);

    const filteredFiles = files.filter(({name}) => name.substr(name.length - 1, 1) !== '/');
    // get only files and not directories
    const userFilesPromises = filteredFiles.map(async (file) => { 
      // downloading files asynchronously all at the same time is
      // few hundred miliseconds faster
      verbose && console.log(`\tDownloading file: ${file.name}`);
      const [fileContents] = await timePromise(file.download());
      return {
        name: path.basename(file.name),
        content: fileContents.toString(),
      }
    });

    const userFiles = await Promise.all(userFilesPromises);

    verbose && console.log(`Total Idle time: ${miliTimes.reduce((acc, val) => acc + val, 0)}`)
    miliTimes = [];

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

    return { statusCode: 500, body: { status: 'error', message: e } };
  }

}


interface FileChange {
  fileName: string;
  type: 'delete' | 'create' | 'rename';
  changes?: string;
}

/**
 * Takes a request object with its body containing
 * sessionId: string
 * userEmail: string
 * fileChanges: {fileName: string, type: 'delete' | 'create' | 'rename' , changes?: string}[]
 * create can create a file or modify a file
 * It parses the request and delete/change files accordingly on data storage accordingly
 * @param {Request} req
 * @returns object with statusCode and body
 */

async function changeFile(req: Request) {
  const valid = await checkValidFileRequest(
    req.body.userEmail,
    req.body.sessionId,
    req.body.fileChanges
  );
  if (valid.isFailure) {
    return failureResponse(valid.message);
  }

  try {
    let fileExists, currentFile, currentFileChange: FileChange;
    for (currentFileChange of req.body.fileChanges) {
      if (!isSimpleValidFileName(currentFileChange.fileName)) { // if it's not a 'simple' valid filename
        verbose && console.log('No simple filename'); // this will make saving file fail silently (bad)
        continue;
      }
      currentFile = fileBucket.file(`${req.body.userEmail}/${currentFileChange.fileName}`);
      if (currentFileChange.type === 'create') {
        verbose && console.log(`\tSaving file: ${currentFileChange.fileName}`);
        // Non-null assertion of changes can be saved
        await timePromise(currentFile.save(currentFileChange.changes!, { resumable: false }));
        // Taken from: https://cloud.google.com/nodejs/docs/reference/storage/1.7.x/File.html#save
        /* There is some overhead when using a resumable upload that can cause noticeable performance 
        degradation while uploading a series of small files. When uploading files less than 10MB, 
        it is recommended that the resumable feature is disabled. */
        await currentFile.setMetadata({ contentType: 'text/javascript' });
        continue;
      }
      fileExists = await currentFile.exists();
      if (!fileExists[0]) {
        verbose && console.log('File does not exist');
        continue;
      }
      if (currentFileChange.type === 'delete') {
        verbose && console.log(`\tDeleting file: ${currentFileChange.fileName}`)
        await timePromise(currentFile.delete());
        continue
      }
      // guaranteed it's a rename
      verbose && console.log(`\tRenaming file: ${currentFileChange.fileName}`)
      await timePromise(currentFile.move(`${req.body.userEmail}/${currentFileChange.changes}`));
    }

    verbose && console.log(`Total Idle time: ${miliTimes.reduce((acc, val) => acc + val, 0)}`)
    // since it's async, miliTimes is shared so there could be different instances of 
    // this function running, and the miliTimes could get cleared out by one function
    // after another function made changes to it, making the array empty.
    miliTimes = [];

    return {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'Files have been updated.'
      }
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: {
        status: 'error',
        message: error
      }
    }
  }
}
/**
 * Given:
 * userEmail: string
 * body: string
 * snapshot: {
 *  fileName: string,
 *  code: string
 *  generation?: number // if there's a generation number, it's a restore
 *  // operation
 * }
 * 
 * It will save the given code to its respective
 * directory in the history bucket.
 *
 * @param {Request} req
 * @returns statusCode and body in object
 */
async function saveToHistory(req: Request) {
  const valid = await checkValidFileRequest(
    req.body.userEmail,
    req.body.sessionId,
    req.body.snapshot
  );
  if (valid.isFailure) {
    return failureResponse(valid.message);
  }

  const snapshot: { fileName: string, code: string, generation?: number } = req.body.snapshot;

  if (!isSimpleValidFileName(snapshot.fileName)) {
    return failureResponse(`${snapshot.fileName} is not a valid file name`);
  }

  try {
    const fullFileName = `${req.body.userEmail}/${snapshot.fileName}`;
    verbose && console.log('Checking if file exists...');
    const fileExists = (await fileBucket.file(fullFileName).exists())[0]
    if (!fileExists) { // checks if file exists in paws-student-files
      verbose && console.log('File does not exists, history not appended');
      return failureResponse('History not updated, file does not exist');
    }
    if (snapshot.code.length === 0) {
      verbose && console.log('No code given, history not appended');
      return {
        statusCode: 200,
        body: { status: 'success', message: 'No code, update not necessary'}
      };
    }
    if (snapshot.generation !== undefined) {
      const restoreFile = historyBucket.file(
        `${req.body.userEmail}/${snapshot.fileName}`,
        { generation: snapshot.generation }
      );
      await restoreFile.delete();
    }
    const newestHistoryExists = (await historyBucket.file(fullFileName).exists())[0];
    let newestFile: Buffer | undefined = undefined;
    if (newestHistoryExists) {
      newestFile = (await historyBucket.file(fullFileName).download())[0];
    }
    if (newestHistoryExists && newestFile !== undefined && newestFile.toString() === snapshot.code) {
      // why can't typescript figure this out? I need to put in newestFile !== undefined...
      verbose && console.log('Code is the same, history not appended');
      return {
        statusCode: 200,
        body: { status: 'success', message: 'Code is the same, update not necessary'}
      };
    }
    const file = historyBucket.file(`${req.body.userEmail}/${snapshot.fileName}`);
    verbose && console.log('Saving snapshot to history...')
    await file.save(snapshot.code, { resumable: false });
    await file.setMetadata({ contentType: 'text/javascript' });
    return {
      statusCode: 200,
      body: {
        status: 'success',
        message: 'History updated'
      }
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
}

/**
 * Given:
 * userEmail
 * sessionId
 * fileName
 * It retrieves the history of fileName
 *
 * @param {Request} req
 * @returns statusCode and body with history
 */
async function getFileHistory(req: Request) {
  const valid = await checkValidFileRequest(
    req.body.userEmail,
    req.body.sessionId,
    req.body.fileName
  );
  if (valid.isFailure) {
    return failureResponse(valid.message);
  }
  if (!isSimpleValidFileName(req.body.fileName)) {
    return failureResponse(`${req.body.fileName} is not a valid file name`);
  }

  try {
    const options = {
      delimiter: '/',
      prefix: req.body.userEmail + '/' + req.body.fileName,
      versions: true
    };

    const [files] = await historyBucket.getFiles(options);
    const filteredFiles = files.filter(
      (elem) => (elem.name.substr(elem.name.length - 1, 1) !== '/')
    );
    const promises = filteredFiles.map(async (elem, index) => {
      const metadata = (await elem.getMetadata())[0]
      const date = new Date(metadata.timeCreated!);
      return {
        generation: metadata.generation!,
        dateCreated: date.toLocaleDateString(),
        timeCreated: date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        code: (await elem.download()).toString(),
      }
    });
    const historyArray = await Promise.all(promises);

    return {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          history: historyArray
        }
      }
    };

  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: {
        status: 'error',
        message: error.message
      }
    };
  }
}

/**
 * Verifies the given token in request
 * and check if user is allowed to be sign in.
 * 
 * @param {Request} req 
 * @returns statusCode and contents in body
 */
async function login(req: Request) {

  // check if user has active session, if so, just return session


  const ticket = await (await getOAuthClient()).verifyIdToken({ // verify and get ticket
    idToken: req.body.token,
    audience: (await getClientID())
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

  let sessionId: string | null = req.body.sessionId; // explicit null is passed into sessionId if it's not there
  if (sessionId === null || sessionId === undefined) {
    sessionId = uid.sync(18);
  }

  const sessionEntityKey = datastore.key([datastoreKind, userEmail, 'session', sessionId]);
  verbose && console.log(`\tSaving session to datastore`);
  await timePromise(datastore.upsert({
    key: sessionEntityKey,
    data: {
      time: Date.now()
    }
  }));

  verbose && console.log(`Total Idle time: ${miliTimes.reduce((acc, val) => acc + val, 0)}`)
  miliTimes = [];

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

let s = 1;
// for testing stuff
async function testDatastore(req: Request) {

  // const kind = 'CS220AllowedAccounts';
  // const users = ['chunghinlee', 'arjunguha', 'rachitnigam', 'sambaxter'];
  // const emailDomain = 'umass.edu'
  // for (let i = 0; i < users.length; i++) {
  //   const userKey = datastore.key([kind, users[i] + '@' + emailDomain]);
  //   const userEntity = {
  //     key: userKey,
  //     data: {
  //       email: users[i] + '@' + emailDomain
  //     }
  //   };

  //   try {
  //     await datastore.save(userEntity);
  //     verbose && console.log(`Saved ${userEntity.key.name}: ${userEntity.data.email}`);
  //   } catch (err) {
  //     console.error('ERROR:', err);
  //   }
  // }

  const file = fileBucket.file('chunghinlee@umass.edu/lolDude.txt');
  const contents = `LOL WHAT THIS IS? ${s++}`;


  file.save(contents, {
    metadata: {
      contentType: 'text/plain'
    }
  }).then(() => {
    verbose && console.log('yayayaya');
  });
  // file.delete().then(() => {
  //   verbose && console.log('DELETED');
  // }).catch(err => {
  //   verbose && console.log('ERror', err.message);
  // });
  return { statusCode: 200, body: { status: 'ok' } };

}

export const paws = express();
paws.use(morgan(':method :url :status :res[content-length] - :response-time ms')); // logging all http traffic

paws.use(cors()); // shouldn't this have options for which domain to allow? (will be dealt later)
// allows cross-origin resource sharing, i.e stops Same Origin Policy from 
// happening across different ports, we need to do this to send post requests
// (Same Origin Policy is on by default to prevent cross site resource forgery)

paws.use(bodyParser.json()); // parse all incoming json data


type Body = {
  status: string,
  message?: string,
  data?: any,
};

function wrapHandler(handler: (req: Request) => Promise<{ statusCode: number, body: Body }>) {
  return (req: Request, res: Response) => {
    handler(req).then(result => {
      res.status(result.statusCode).json(result.body);
    }).catch(reason => {
      console.error(reason);
      // TODO(arjun): In deployment, it may be unsafe to send the exception
      // to the untrusted client.
      res.status(500).send(reason.toString());
    });
  }
}

paws.get('/', (req: Request, res: Response) => { // simple get request
  res.status(200).send('Hello World');
});

paws.post('/getfile', wrapHandler(getFile));
paws.post('/login', wrapHandler(login));
paws.post('/changefile', wrapHandler(changeFile));
paws.post('/savehistory', wrapHandler(saveToHistory));
paws.post('/gethistory', wrapHandler(getFileHistory));
paws.get('/testo', wrapHandler(testDatastore));