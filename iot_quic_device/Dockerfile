FROM node:11.12.0-alpine

LABEL maintainer="Jesus Macias Portela<me@jesusmacias.es>"
LABEL maintainer="Fernando Ruiz Hernandez"

#Development dependecies
RUN apk add ncurses bash git

ADD . /opt/device
WORKDIR /opt/device
RUN cd /opt/device && npm install

EXPOSE 20190

CMD ["node", "device.js"]