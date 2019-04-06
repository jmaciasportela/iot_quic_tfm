// Project:  IoT QUIC server
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const quic = require('node-quic');
const jsscompress = require("js-string-compression");
const hm = new jsscompress.Hauffman();
const device = require('../controller/deviceIoT');
const log = require('./logger').getLogger();

const port = process.env.PORT || 20190;
const endPoint = process.env.PORT || "iot_quic_server";
const enableCompression = false;
let configuration;

getConfig = async () => {
    if (configuration) {
        return configuration;
    }
    configuration = await device.getDeviceConfig();
    return configuration;
};

exports.sendRequest = (data) => {
    log.debug(data);
    return new Promise((resolve, reject) => {
        quic.send(port, endPoint, enableCompression ? hm.compress(JSON.stringify(data)) : JSON.stringify(data))
            .then(() => {
            })
            .onData((response) => {
                log.info("Response received");
                const parsedData = enableCompression ? JSON.parse(hm.decompress(response)): JSON.parse(response);
                log.debug(parsedData);
                validateResponse(parsedData);
                resolve(parsedData);
            })
            .onError((error) => {
                log.error(error);
                reject({status: 'error'});
            });
    });
};

validateResponse = async (response) => {
    let tokens = await device.getDeviceTokens();

    switch (response.code) {
        case 401:
            if (tokens.hasOwnProperty("accessToken")) {
                log.info("Invalid AccessToken. Go to state REFRESH.");
                device.setDeviceStatus(3);
            } else {
                log.info("Incorrect credentials. Go to state DISABLED. IDDLE mode until device restart");
                device.setDeviceStatus(5);
            }
            break;
        case 403:
            if (tokens.hasOwnProperty("accessToken")) {
                log.info("Invalid AccessToken. Go to state REFRESH.");
                device.setDeviceStatus(3);
            } else {
                log.info("Incorrect credentials. Go to state DISABLED. IDDLE mode until device restart");
                device.setDeviceStatus(5);
            }
            break;
        case 700:
            log.info("IoT device not provisioned anymore. Go to state NOT PROVISIONED.");
            device.resetDevice();
            break;
    }
}