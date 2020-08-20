ARG REG_HOSTNAME
ARG REG_FOLDER
FROM ${REG_HOSTNAME}/${REG_FOLDER}/kern.js:latest
MAINTAINER Gerald Wodni <gerald.wodni@gmail.com>

WORKDIR /usr/src/app/websites/editor

COPY . .
RUN npm install

WORKDIR /usr/src/app
