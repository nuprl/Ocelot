# OcelotAccounts
A small typescript-based command-line application that can add or remove given email(s) from Ocelot's database, allowing and revoking access to Ocelot.

## Getting started
Instructions below specify how to get it running.

### Prerequisites
 - [Node](https://nodejs.org/en/) (for running JavaScript)
 - [Google Cloud SDK](https://cloud.google.com/sdk/) (for accessing Google Cloud datastore, must have enough priviledge to modify datastore)
  
Be sure `gcloud` is setup to the right configurations. If not:
```bash
gcloud auth application-default login # to log in
gcloud config set project <project_name> # set project
```
If you don't know the name of your project:
```bash
gcloud projects list # list all your projects
```

### Installing

```bash
npm install # to get all packages
npm run-script build-bin # to build the JavaScript file
```
### Running
There will be a JavaScript file that resides in the `bin` directory.
 - Add email to Ocelot access
    ```bash
    ./bin/oc add example@gmail.com
    ```
 - Quickly add multiple emails
    ```bash
    ./bin/oc add example@gmail.com example@aol.com
    ```
 - Remove email from Ocelot access
    ```bash
    ./bin/oc remove example@gmail.com 
    ```
 - Add all emails in comma-separated file
    ```bash
    ./bin/oc bulk ./path/to/file.csv
    ```
 - Remove all emails in comma-separated file
    ```bash
    ./bin/oc bulk -m remove ./path/to/file.csv
    ```
 - And to display help
   ```bash
   ./bin/oc --help
   ```
