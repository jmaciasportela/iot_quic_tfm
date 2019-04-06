// Project:  IoT QUIC server
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const fs = require('fs');
const appRoot = require('app-root-path');
const jwt = require('jsonwebtoken');
const randomstring = require("randomstring");

const log = require('../lib/logger').getLogger();

exports.getRootPath = function () {
  return appRoot;
};

exports.randomIntInc = function (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low)
}

exports.isEmptyDict = function (obj) {
  return Object.keys(obj).length === 0;
}

exports.getRandomCode = (length) => {
  return randomstring.generate(length);
}

exports.getIMSI = function () {
  return Math.random().toString().slice(2,17);
}

exports.getTime = () => {
  return (new Date()).valueOf()
}

exports.verifyDeviceTokens = (tokens) => {
  var response = {};
  var publicKey = fs.readFileSync(appRoot + '/certs/RS256.key.pub');
  try {
    var decodedAccessToken = jwt.verify(tokens.accessToken, publicKey, { clockTolerance: 60 });
    log.debug("Decode accessToken: " + JSON.stringify(decodedAccessToken));
    response.accessToken = {
      exp: decodedAccessToken.exp,
      token: tokens.accessToken
    }
  } catch(err) {
    log.error(err)
    throw err;
  }
  try {
    var decodedRefreshToken = jwt.verify(tokens.refreshToken, publicKey);
    log.debug("Decode refreshToken: " + JSON.stringify(decodedRefreshToken));
    response.refreshToken = {
      exp: decodedRefreshToken.exp,
      token: tokens.refreshToken
    }
  } catch(err) {
    log.error(err)
    throw err;
  }
  return response;
}

exports.printBanner = () => {
  log.info("*******************************************************************");
  log.info("********************** IOT QUIC METADEVICE ************************");
  log.info("************* Master en ciberseguridad 2da edicion ****************");
  log.info("******* Bootstraping de credenciales en dispositivos IoT **********");
  log.info("******** Jesús Macias Portela & Fernando Ruiz Hernandez ***********");
  log.info("************* https://www.campusciberseguridad.com/ ***************");
  log.info("*******************************************************************");
}