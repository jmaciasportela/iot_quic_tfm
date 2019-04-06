FROM node:11.12.0-alpine

LABEL maintainer="Fernando Ruiz Hernandez"
LABEL maintainer="Jesus Macias Portela <me@jesusmacias.es>"

#Development dependecies
RUN apk add ncurses bash git

ADD . /opt/server
WORKDIR /opt/server
RUN cd /opt/server && npm install

EXPOSE 20190

CMD ["node", "server.js"]