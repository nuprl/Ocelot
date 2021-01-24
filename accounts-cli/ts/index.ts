#!/usr/bin/env node
import * as program from 'commander';
import { readFileSync } from 'fs';
import { Datastore } from '@google-cloud/datastore';
import { entity } from '@google-cloud/datastore/build/src/entity';
import * as loadingSpinner from 'ora';
import chalk from 'chalk';

const datastore = new Datastore({});
const datastoreKind = 'CS220AllowedAccounts';

let spinner = loadingSpinner({
  text: 'Processing email(s)',
  spinner: 'dots'
})

enum Action {
  ADD,
  REMOVE
}

enum Format {
  CSV,
  NEWLINE
}

program.version('0.0.1', '-v, --version')

/**
 * A good enough function to validate email string
 * Source: https://stackoverflow.com/a/46181
 * @param email
 */
function isValidEmail(email: string) {
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Return array of unique elements given array with possible duplicates
 * @param a 
 * @returns unique array of elements
 */
function uniquifyArray<T>(a: T[]): T[] {
  return Array.from(new Set(a));
}

/**
 * Converts email to entity for entry in datastore
 * @param email 
 * @returns proper entity
 */
function emailToEntity(email: string): { key: entity.Key, data: { email: string } } {
  const lowercaseEmail = email.toLowerCase();
  const allowedAccountsKey = datastore.key([datastoreKind, lowercaseEmail]);
  return {
    key: allowedAccountsKey,
    data: {
      email: lowercaseEmail
    }
  };
}

function logInfo(message: string) : void {
  console.log(chalk.blue('info'), message);
}

function logError(message : string) : void {
  console.log(chalk.red('error'), message);

}

function logSuccess(message: string) : void {
  console.log(chalk.green('success'), message);
}

/**
 * Used for logging general email results
 * @param modifiedNumEmails number of emails that were properly processed
 * @param totalNumEmails total number of emails that were given
 * @param action type of action
 */
function logEmailsResults(modifiedNumEmails: number, totalNumEmails: number, action: Action) : void {
  const phrase = action === Action.ADD ? 'added' : 'removed';
  if (modifiedNumEmails === 0) {
    logInfo(`Email(s) already ${phrase}.`);
    return;
  }
  logSuccess(`${modifiedNumEmails} out of ${totalNumEmails} given emails are ${phrase}`);
  if (modifiedNumEmails !== totalNumEmails) {
    const leftOver = totalNumEmails - modifiedNumEmails;
    logInfo(`└─${leftOver} ${leftOver === 1 ? 'was' : 'were'} already ${phrase}.`);
  }
}

/**
 * Given an action and an array of emails, it validates them all, converts them
 * to data entries, and add/remove them all to/from the datastore
 * @param emails 
 * @returns number of entities either added or remove
 */
async function addRemoveEmails(action: Action, emails: string[]): Promise<number> {
  const uniqueEmails = uniquifyArray<string>(emails);
  for (let email of uniqueEmails) {
    if (!isValidEmail(email)) {
      throw new Error(`${email} is not a valid email`)
    }
  }
  const entities = uniqueEmails.map(emailToEntity);
  let entitiesUpdated : Promise<number> = new Promise((resolve, reject) => {
    let responseHandler = (err: Error | undefined | null, apiResponse) => {
      if (err !== null && err !== undefined) {
        console.log(err);
        reject((err as any));
        return;
      }
      resolve(apiResponse.indexUpdates / 3);
    };
    if (action === Action.ADD) {
      datastore.save(entities, responseHandler); // this does not return promises
    } else { // must be Action.Remove
      datastore.delete(entities.map(entity => entity.key), responseHandler)
    }
  });
  return entitiesUpdated;
}

/**
 * Given action, returns function that either adds or remove given email
 * @param action 
 * @returns function that adds or removes email from datastore
 */
function createEmailAction(action: Action): (email: string, moreEmails: string[]) => void {
  return async (email: string, moreEmails: string[]) => {
    try {
      spinner.start();
      const numberOfModifiedEntities = await addRemoveEmails(action, [email].concat(moreEmails));
      spinner.stop();
      const phrase = action === Action.ADD ? 'added' : 'removed';
      if (numberOfModifiedEntities === 0 && moreEmails.length === 0) {
        logInfo(`${email} is already ${phrase}`);
        return;
      }
      if (moreEmails.length === 0 && numberOfModifiedEntities === 1) { // user provided only one email
        logSuccess(`${email} ${phrase}.`);
        return;
      }
      logEmailsResults(numberOfModifiedEntities, moreEmails.length + 1, action);
    } catch (err) {
      logError(err);
      process.exit(1);
    }
  };
}

/**
 * Similar to emailAction but returns a function that reads
 * a comma separated file and adds/removes as many emails specified
 * @param action 
 * @returns function that takes in path string 
 */
function createBulkAction(action: Action, format: Format): (path: string) => void {
  return async (path: string) => {
    try {
      let separator = format === Format.CSV ? ',' : '\n';
      const emails = readFileSync(path, 'utf8')
        .toString()
        .split(separator)
        .map(elem => elem.trim())
        .filter(elem => elem.length !== 0);
      spinner.start();
      const numberOfModifiedEntities = await addRemoveEmails(action, emails);
      spinner.stop();
      logEmailsResults(numberOfModifiedEntities, emails.length, action);
    } catch (err) {
      console.error('Caught error');
      console.log(err);
      process.exit(1);
    }

  };
}


program
  .command('add <email> [moreEmails...]')
  .description('Add email(s) to Ocelot database to allow user to log in')
  .action(createEmailAction(Action.ADD));

program
  .command('remove <email> [moreEmails...]')
  .description('remove email(s) from Ocelot Database to revoke access')
  .action(createEmailAction(Action.REMOVE));

program
  .command('bulk <path>')
  .description('Bulk add/remove emails to Ocelot database with comma-separated/newline-separated file.')
  .option('-m, --mode <mode>', 'Change mode to add or remove (default: add)')
  .option('-t, --format <format>', 'Change file format to process: newline or csv (default: csv)')
  .action((path: string, cmd: { mode: string | undefined, format: string | undefined }) => {
    let mode = (cmd.mode || 'add').toLowerCase();
    let format = (cmd.format || 'csv').toLowerCase();
    let stringToFormat = (str : string) : Format => {
      if (str !== 'csv' && str !== 'newline') {
        logError(`${str} is not a proper format, either csv or newline.`);
        logInfo(`See ${chalk.bold('--help')} for a list of available options`);
        process.exit(1);
      }
      if (str === 'csv') {
        return Format.CSV;
      }
      return Format.NEWLINE;
    };

    let modeStringToAction = (str: string) : Action => {
      if (str !== 'add' && str !== 'remove') {
        logError(`${str} is not a proper mode, either add or remove.`);
        logInfo(`See ${chalk.bold('--help')} for a list of available options`);
        process.exit(1);
      }
      if (str === 'add') {
        return Action.ADD;
      }
      return Action.REMOVE;
    }

    createBulkAction(modeStringToAction(mode), stringToFormat(format))(path);
  });

program.on('command:*', () => {
  logError(`invalid command "${program.args.join(' ')}"`);
  logInfo(`See ${chalk.bold('--help')} for a list of available commands.`)
  process.exit(1);
});

program.parse(process.argv)

if (program.args.length === 0) {
  program.help();
}
