# Ocelot

An online IDE that integrates [Stopify](https://github.com/plasma-umass/Stopify), a compiler that enables users to stop long-running programs with arbitrarily deep recursion and infinite loops. It also integrates an academic sublanguage of JavaScript, _ElementaryJS_.

## Dependencies

1. You'll need the following:
    - [Node](https://nodejs.org/en/)
    - [Yarn](https://www.yarnpkg.com)
    - [Google Cloud SDK](https://cloud.google.com/sdk/)

1. Be sure you're authenticated on Google Cloud and on your computer:
    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```
    If this is the only GCloud project you are working on, set the project to PLASMA:
    ```bash
    gcloud config set project arjunguha-research-group
    ```
    Else, you will have to manually specify the project ID when deploying the backend:
    ```bash
    yarn deploy --project arjunguha-research-group
    ```

## Build & Run Instructions
Follow these instructions to use the deployed versions of Stopify, and ElementaryJS with Ocelot.

To setup Ocelot frontend:

```bash
cd Ocelot/frontend && yarn install && yarn run build
```

To run Ocelot locally:

```bash
cd Ocelot/frontend
yarn run serve-local
```

To setup and run backend locally

```bash
cd Ocelot/backend
yarn install
yarn run build && yarn run serve
```

## Development Instructions

Occasionally, you will want to hack on ElementaryJS (EJS), and will want to test out your changes before deploying them. To do so:

1. Clone EJS: github.com/plasma-umass/elementaryJS/
1. Install dependencies of EJS and build it (from within the EJS dir):
    ```
    yarn install
    yarn build
    yarn test
    ```
1. Hack on EJS code, and re-build.
1. Tell yarn to make the local version of EJS available to other projects:
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
1. Change to the Ocelot frontend dir, and tell yarn to use the local version of EJS:
    ```
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
1. Once you are done hacking on the local EJS changes, push a PR, and once merged, you can `npm publish` a version update of EJS, and then create an Ocelot PR to use the newly deployed version of EJS.
1. To tell yarn to go back to the published version of EJS:
    In the `Ocelot/frontend` directory:
    ```
    yarn unlink "@stopify/elementary-js"
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
