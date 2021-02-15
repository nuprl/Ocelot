# Ocelot

A web-based IDE for JavaScript, without the "bad parts".  See
[https://www.ocelot-ide.org](https://www.ocelot-ide.org) for more information.

This is a README to get started hacking on Ocelot.

## Dependencies and Cloud Configuration

1. Install [Node](https://nodejs.org/en/) and the
   [Google Cloud SDK](https://cloud.google.com/sdk/) on your development
   machine. We use Node 14.

1. Create a project on Google Cloud Platform to host Ocelot. You can
   reuse an existing project, as long as you don't mind setting Cloud Datastore
   to Datastore mode permanently for that project. *If you are already using
   Cloud Datastore in Native mode, you will need to create a new project.*

1. A domain to host Ocelot. For example, you can use a subdomain of
   `github.io`, if you do not want to pay for a domain name,

1. Ensure your development machine is logged in to the Google Cloud Platform
    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```

1. Create a project on Google Cloud Platform and note down its Project ID.
   If this is the only Google Cloud project that you are using, you can set it
   as the default project on your machine:

    ```bash
    gcloud config set project PROJECT_ID
    ```

    Otherwise, you will have to add the `--project PROJECT_ID` flag to all
    subsequent commands that manipulate Google Cloud resources. The remaining
    instructions assume that you set the default project.

1. Create a bucket for Ocelot to store files. For example, the following
   command creates a bucket called `ocelot-ide-org-files`, and sets the storage
   class to regional, which is a cheaper storage option than the default, which
   replicates data across multiple data centers. The `-b on` flag disables
   per-file ACLs and isn't strictly necessary.

   ```bash
   gsutil mb -b on -c Regional -l us-central1 gs://ocelot-ide-org-files
   ```

1. Create a bucket for Ocelot to store revision history. For example:

   ```bash
   gsutil mb -b on -c Regional -l us-central1 gs://ocelot-ide-org-history
   ```

1. Enable object versioning on the former bucket. Ocelot relies on object
   versioning to implement its history feature:


   ```bash
   gsutil versioning set on gs://ocelot-ide-org-history
   ```

1. Using your web browser, go to the 
   [Google Cloud Datastore](https://console.cloud.google.com/datastore) 
   console and create a database in **Datastore Mode**. (**Do not use
   Native Mode.**) You will need to chose the datastore location. We recommend
   choosing the same region that you used for the two buckets that you created
   above.

1. Using your web browser, configure the 
   [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
   for the Google Cloud project. It is straightforward to setup the application
   for testing, which limits you to 100 users over the lifetime of the testing
   period.

1. Using your web browser, go to the
   [Credentials](https://console.cloud.google.com/apis/credentials) page for
   the Google Cloud project. Click the *Create Credentials* button and then
   click *OAuth client ID*. On the next page, select *Web application* as
   the application type and enter the domain name at which you plan to
   host Ocelot.

1. Using your web browser,
  [Enable the Google Cloud Build API](https://console.developers.google.com/apis/library/cloudbuild.googleapis.com) and the
  [Stackdriver Error Reporting API](https://console.cloud.google.com/apis/api/clouderrorreporting.googleapis.com/overview)

1. Copy the file `/env.yaml` to `/backend/env.yaml` and edit it as directed
   in the file.

## Building and Deploying the Ocelot backend

```
cd backend
npm install
npm run-script build
npm run-script deploy
```

## Building and Deploying the Ocelot frontend

Edit the file `frontend/src/secrets.ts`.

Run the following commands:

```
cd frontend
npm install
npm run-script build
```

At this point, you need to deploy the contents of `frontend/build` to a
static web hosting provider. For example, if you plan to use GitHub Pages, you
can create a repository with the contents of `frontend/build`, push that
repository to a new GitHub pages, and serve it.

## Copyright

Copyright 2018--2020 University of Massachusetts Amherst

Copyright 2019--2021 University of Texas at Austin

Copyright 2020--2021 Northeastern University


## Old Instructions Below

To setup and run backend locally

```bash
cd Ocelot/backend
yarn install
yarn run build && yarn run serve
```

## Development Instructions

Occasionally, you will want to hack on ElementaryJS (EJS), and will want to test out your changes before deploying them. To do so:

1. Clone EJS: https://github.com/plasma-umass/elementaryJS/
1. Install dependencies of EJS and build it (from within the EJS dir):
    ```
    yarn install
    yarn build
    yarn test
    ```
1. Hack on EJS code, and re-build.
1. Tell yarn to make the local version of EJS available to other projects (still within the EJS dir):
    ```
    yarn link
    ```
    Yarn should then tell you:
    ```
    yarn link v1.10.1
    success Registered "@stopify/elementary-js".
    info You can now run `yarn link "@stopify/elementary-js"` in the projects where you want to use this package and it will be used instead.
    Done in 0.03s.
    ```
1. Change to the Ocelot frontend dir, delete any cached EJS libs, and tell yarn to use the local version of EJS:
    ```
    rm -rf node_modules/@stopify/elementary-js
    yarn link "@stopify/elementary-js"
    ```
    Yarn should tell you:
    ```
    yarn link v1.10.1
    success Using linked package for "@stopify/elementary-js".
    Done in 0.18s.
    ```
1. Compile the ocelot frontend, and deploy it locally:
    ```
    yarn build && yarn serve-local
    ```
1. Further changes to EJS will not require you to run the "link" steps again. Yarn remembers that you told it to use the local versions. Just recompile both EJS and the Ocelot frontend.

Once you are done hacking on the local EJS changes:
1. Push a PR to EJS with the updates and the version number updated in `package.json` for EJS.
1. Run `npm publish` to update the published version of EJS
1. Create an Ocelot PR to use the newly deployed version of EJS by editing the EJS version number in `package.json` in `Ocelot/frontend`
1. To tell yarn to go back to the published version of EJS:
In the `Ocelot/frontend` directory:
```
yarn unlink "@stopify/elementary-js"
yarn install
```

## Issues you may have

- Delete this directory: `rm -rf Ocelot/node_modules`

- There is a bug in the latest Yarn (1.7) that gives a stupid error when you
  use `yarn install` or `yarn add` after running `yarn link`:

  https://github.com/yarnpkg/yarn/issues/5876

  So, first run:

  ```
  yarn unlink stopify && yarn unlink elementary-js && yarn link stopify-continuations
  ```

  Then run `yarn install` or `yarn add ...`:

  then in `Ocelot/frontend`, run:

  ```
  yarn link stopify && yarn link elementary-js && yarn link stopify-continuations
  ```
