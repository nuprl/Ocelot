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
import { ErrorReporting } from '@google-cloud/error-reporting';
import * as rpn from 'request-promise-native';
import { URLSearchParams } from 'url';

const errorReporting = new ErrorReporting();

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

function reportError(req: Request, message: string) {
  const evt = errorReporting.event();
  evt.setUser(req.body.username);
  evt.setServiceContext('ocelot', req.body.version);
  evt.setUserAgent(req.body.userAgent);
  evt.setMessage(message.replace(/[^A-Za-z]/g,'_') + ': ' + message);
  errorReporting.report(evt);
  console.error(message);
}

async function getSettings() {
  if (settings !== undefined) {
    return settings;
  }
  const settingsFile = await settingsBucket.file('ocelot-settings.json').download();
  return JSON.parse(settingsFile.toString());
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

function undefinedOrNull(...properties: (any | undefined | null)[]) {
  function isInvalid(acc: boolean, val: (any | undefined | null)) {
    return acc || typeof val === 'undefined' || val === null;
  }
  return properties.reduce(isInvalid, false);
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
  const [results] = await datastore.runQuery(query);
  if (results.length === 1 && isWithinSessionTime((results[0] as any).time)) {
    await updateSessionId(userEmail, sessionId);
    return true;
  }
  return false;
}

type AsyncResponse = Promise<{ statusCode: number, body: any }>;

/**
 * A simpler version of wrapHandler that allows the body to be any JSON value.
 */
function wrapHandler2(handler: (req: Request) => AsyncResponse) {
  return (req: Request, res: Response) => {
    handler(req).then(result => {
      res.status(result.statusCode).json(result.body);
    }).catch(reason => {
      reportError(req, String(reason));
      res.status(500).send('An exception was raised on the server');
    });
  }
}

/**
 * Calls 'handleAuthorized' only if the request is authorized to use Ocelot. Otherwise, responds with
 * an error.
 */
async function authorize(req: Request,
  handleAuthorized: (email: string) => AsyncResponse): Promise<{ statusCode: number, body: any }> {
  const userEmail = req.body.userEmail;
  const sessionId = req.body.sessionId;
  if (typeof userEmail !== 'string' || typeof sessionId !== 'string') {
    const msg = `authorization malformed (${userEmail}, ${sessionId})`;
    reportError(req, msg);
    return { statusCode: 403, body: msg };
  }
  if (!await checkValidSession(userEmail, sessionId)) {
    const msg = `authorization failed (${userEmail}, ${sessionId})`;
    reportError(req, msg);
    return { statusCode: 403, body: msg };
  }
  return handleAuthorized(userEmail);
}

async function checkValidUser(userEmail: string): Promise<boolean> {
  const query = datastore
    .createQuery(datastoreKind)
    .filter('__key__', '=', datastore.key([datastoreKind, userEmail]));
  const [results] = await datastore.runQuery(query);
  return results.length === 1;
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

function isSimpleValidEmail(email: string) {
  return /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+$/.test(email);
}

function isSimpleValidFileName(fileName: any): fileName is string {
  return typeof fileName === 'string' && /^[\w\-]+\.js$/.test(fileName);
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

interface FileChange {
  fileName: string;
  type: 'delete' | 'create';
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

  const currentFileChange: FileChange = req.body.fileChanges;
  if (!isSimpleValidFileName(currentFileChange.fileName)) {
    // if it's not a 'simple' valid filename
    return failureResponse(`Could not make changes to file: ${currentFileChange.fileName}, name not valid`);
  }

  const currentFile = fileBucket.file(`${req.body.userEmail}/${currentFileChange.fileName}`);
  if (currentFileChange.type === 'create') {
    // Non-null assertion of changes can be saved
    await currentFile.save(currentFileChange.changes!, { resumable: false });
    // Taken from: https://cloud.google.com/nodejs/docs/reference/storage/1.7.x/File.html#save
    /* There is some overhead when using a resumable upload that can cause noticeable performance
    degradation while uploading a series of small files. When uploading files less than 10MB,
    it is recommended that the resumable feature is disabled. */
    await currentFile.setMetadata({ contentType: 'text/javascript' });
  }
  else if (currentFileChange.type === 'delete') {
    await currentFile.delete();
  }
  else {
    return { statusCode: 500, body: { status: 'error', message: `Bad file operation` } };
  }

  return {
    statusCode: 200,
    body: {
      status: 'success',
      message: 'Files have been updated.'
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

  const fullFileName = `${req.body.userEmail}/${snapshot.fileName}`;
  const fileExists = (await fileBucket.file(fullFileName).exists())[0]
  if (!fileExists) { // checks if file exists in paws-student-files
    return failureResponse('History not updated, file does not exist');
  }
  if (snapshot.code.length === 0) {
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
    return {
      statusCode: 200,
      body: { status: 'success', message: 'Code is the same, update not necessary'}
    };
  }
  const file = historyBucket.file(`${req.body.userEmail}/${snapshot.fileName}`);
  await file.save(snapshot.code, { resumable: false });
  await file.setMetadata({ contentType: 'text/javascript' });
  return {
    statusCode: 200,
    body: {
      status: 'success',
      message: 'History updated'
    }
  };
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
  const ticket = await (await getOAuthClient()).verifyIdToken({
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
    console.error(`Unauthorized login attempt by ${userEmail} (${payload.name})`);
    return { statusCode: 200, body: { status: 'failure', 'message': 'Unauthorized' } };
  }
  // at this point the user is CS220 student/teacher of some sort.

  let sessionId: string | null = req.body.sessionId; // explicit null is passed into sessionId if it's not there
  if (sessionId === null || sessionId === undefined) {
    sessionId = uid.sync(18);
  }

  const sessionEntityKey = datastore.key([datastoreKind, userEmail, 'session', sessionId]);
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

async function downloadUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return await rpn.get(url, { encoding: null });
  } else {
    throw 'URL not supported';
  }
}

async function getUrl(req: Request, res: Response) {
  try {
    let params = new URLSearchParams(req.url);
    const url = params.get('/geturl?url');
    const userEmail = params.get('user');
    const sessionId = params.get('session');
    if (undefinedOrNull(url, userEmail, sessionId)) {
      res.status(500).send("Incomplete request");
      return;
    }
    const validSession = await checkValidSession(userEmail as string, sessionId as string);
    if (!validSession) {
      res.status(500).send("Invalid session");
      return;
    }
    const validUser = await checkValidUser(userEmail as string);
    if (!validUser) {
      res.status(500).send("Invalid user");
      return;
    }
    try {
      res.status(200).send(await downloadUrl(url as string));
    } catch(e) {
      res.status(500).send(typeof e === 'string' ? e : 'Invalid URL');
    }
  } catch(e) {
    res.status(500).send('Exception: ' + e.toString());
  }
}

export const paws = express();
morgan.token('username', function(req, res) {
  if (req.body.userEmail) {
    return req.body.userEmail;
  }
  const username = (new URLSearchParams(req.url)).get('user');
  if (username) {
    return username;
  }
  return 'notprovided'
});

morgan.token('ocelotversion', (req, res) => {
  if (req.body.ocelotVersion) {
    return req.body.ocelotVersion
  }
  return 'notprovided'
});

morgan.token('ejsversion', (req, res) => {
  if (req.body.ejsVersion) {
    return req.body.ejsVersion;
  }
  return 'notprovided'
});

paws.use(morgan(
  ':method :url :status :username ocelot-:ocelotversion ejs-:ejsversion :res[content-length] - :response-time ms',
  {
    stream: {
      write: (str: string) => console.log(str)
    }
  })); // logging all http traffic

paws.use(cors({
origin: [
  'https://umass-compsci220.github.io',
  'http://localhost:8080',
  'http://localhost:8081'
]}));

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
      reportError(req, String(reason));
      res.status(500).send('An exception was raised on the server');
    });
  }
}

paws.post('/listfiles', wrapHandler2(req =>
  authorize(req, async email => {
    const [files] = await fileBucket.getFiles({ prefix: `${email}/` });
    return {
      statusCode: 200,
      body: files.map(file => path.basename(file.name))
    };
  })));

paws.post('/read', wrapHandler2(req =>
  authorize(req, async email => {
    const filename = req.body.filename;
    if (!isSimpleValidFileName(filename)) {
      return { statusCode: 400, body: 'invalid filename' };
    }
    const [buf] = await fileBucket.file(`${email}/${filename}`).download();
    return { statusCode: 200, body: buf.toString() };
  })));

paws.post('/login', wrapHandler(login));
paws.post('/changefile', wrapHandler(changeFile));
paws.post('/savehistory', wrapHandler(saveToHistory));
paws.post('/gethistory', wrapHandler(getFileHistory));
paws.get('/geturl', getUrl);

function str(x: any): string {
  try {
    return (typeof x === 'string') ? x : JSON.stringify(x);
  } catch (e) {
    return 'could not stringify';
  }
}

paws.post('/error', wrapHandler(async req => {
  if (req.headers['content-type'] !== 'application/json') {
    reportError(req, str(req.body));
  }

  const message: string[] = [];

  if (typeof req.body.message === 'string') {
    message.push(req.body.message);
  }

  reportError(req, str(req.body.message));

  return { statusCode: 200, body: { status: 'ok' } };
}));

// NOTE(arjun): Experimental. Do not use
paws.post('/exception', wrapHandler(async req => {
  const contentType = req.headers['content-type'];
  if (contentType !== 'application/json') {
    errorReporting.report('BadRequest:', req,
    `Content-type: ${contentType}`);
    return { statusCode: 400, body: { status: 'failure' } };
  }

  return { statusCode: 200, body: { status: 'ok' } };

}));
