// Project:  IoT QUIC Metadevices
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const appRoot = require('app-root-path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
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

exports.getIMSI = function () {
  return Math.random().toString().slice(2,17);
}

exports.getTime = () => {
  return (new Date()).valueOf()
}

exports.getToken = (data, expiration=null) => {
  //RS256
  var privateKey = fs.readFileSync(appRoot + '/certs/RS256.key');
  var options = { algorithm: 'RS256' }
  if(expiration !== null) {
    options.expiresIn = expiration;
  }
  log.debug(data)
  // Delete 2AuthCode
  delete data.code;
  log.debug(options)
  var token = jwt.sign({ data: data }, privateKey, options);
  return token;
}

exports.verifyAccessToken = (token) => {
  var publicKey = fs.readFileSync(appRoot + '/certs/RS256.key.pub');
  try {
    var decoded = jwt.verify(token, publicKey);
    log.debug("Decode accessToken. Correct Signature");
  } catch(err) {
      //log.error(err);
      parsedError = JSON.parse(JSON.stringify(err));
      log.error(parsedError);
      throw parsedError;
  }
  return decoded;
}

exports.verifyRefreshToken = (token) => {
  var publicKey = fs.readFileSync(appRoot + '/certs/RS256.key.pub');
  try {
    jwt.verify(token, publicKey);
    log.debug("Decode refreshToken. Correct Signature");
  } catch(err) {
      log.error(err);
      parsedError = JSON.parse(JSON.stringify(err));
      log.error(parsedError);
      throw parsedError;
  }
}

exports.printBanner = () => {
  log.info("*******************************************************************");
  log.info("************************* IOT QUIC SERVER *************************");
  log.info("************* Master en ciberseguridad 2da edicion ****************");
  log.info("******* Bootstraping de credenciales en dispositivos IoT **********");
  log.info("******** Jesús Macias Portela & Fernando Ruiz Hernandez ***********");
  log.info("************* https://www.campusciberseguridad.com/ ***************");
  log.info("*******************************************************************");
}

