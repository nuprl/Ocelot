#!/bin/sh
set -x
set -e
npx tsc
rsync -azdOL src/static build/dist
npx webpack
