# Ocelot

An online IDE that integrates [Stopify](https://github.com/plasma-umass/Stopify), a compiler that enables users to stop long-running programs with arbitrarily deep recursion and infinite loops. It also integrates an academic sublanguage of JavaScript, _ElementaryJS_.

## Build Instructions

You'll need the following:
- [Node](https://nodejs.org/en/)
- [Yarn](https://www.yarnpkg.com)
- [Google Cloud SDK](https://cloud.google.com/sdk/)

Be sure you're authenticated on Google Cloud and on your computer:
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

Follow these instructions to use the bleeding-edge versions of Stopify, and ElementaryJS with Ocelot.

To install Stopify:

```bash
cd Stopify
git checkout 220-Aug22
./make_220.sh
```

To install ElementaryJS:

```bash
cd ElementaryJS
yarn install
yarn run build
yarn run test
yarn link
```

To setup Ocelot frontend:

```bash
cd Ocelot/frontend && yarn install && yarn link stopify && yarn link stopify-continuations && yarn link elementary-js && yarn run build
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

## To hack on the 220 library locally

```bash
cd Ocelot/frontend/build
ln -s <path-to-local-220-library> lib220.js
```

## Issues you will have

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
