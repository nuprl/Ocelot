FROM ubuntu:18.04
MAINTAINER Arjun Guha <arjun@cs.umass.edu>
WORKDIR /root

RUN apt-get update -y
RUN apt-get install -y curl build-essential
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get -y install yarn

COPY . /root/ocelot
WORKDIR /root/ocelot
WORKDIR /root/ocelot/backend
RUN yarn install
RUN yarn run build
WORKDIR /root/ocelot/frontend
RUN yarn install
RUN yarn run build
