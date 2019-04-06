// Project:  IoT QUIC server
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const device = require('../controller/deviceIoT');
const quicClient = require('../lib/quic');
const db = require('../db/db').getDB();
const log = require('../lib/logger').getLogger();
const utils = require('../lib/utils');

const requestMessage = {
    authentication: '',
    resource: '',
    payload: null
}

let publishInterval=null;
let configuration;

getConfig = async () => {
    if (configuration) {
        return configuration;
    }
    configuration = await device.getDeviceConfig();
    return configuration;
};

exports.registerDevice = async () => {
    const config = await getConfig();
    const registerMessage = {
        uuid: config.uuid,
        deviceType: config.type,
        serialId: config.serialId,
        networkType: 'Mobile',
        networkId: config.networkId,
        validationMethods: ['SMS', 'TOTP']
    }

    log.info("Go to state REGISTERING");
    device.setDeviceStatus(1);
    let request = JSON.parse(JSON.stringify(requestMessage));
    request.resource = 'registerDevice';
    request.payload = registerMessage;

    quicClient.sendRequest(request)
        .then( data => {
            if (data.code === 200){
                log.info("Device pre-registered");
                // Read 2Auth code from SMS
                const code = utils.getRandomCode(12);
                log.info("2Auth code received: " + code);
                exports.login();
            } else {
                switch (data.code) {
                    case 403:
                        log.info("Device not recognized. Go to state DISABLED. IDDLE mode until device restart");
                        device.setDeviceStatus(5);
                        break;
                    case 412:
                        log.info("Not available 2 Auth method. Go to state DISABLED. IDDLE mode until device restart");
                        device.setDeviceStatus(5);
                        break;
                }
            }
        })
        .catch( err => {
            log.error(err)
        });
}

exports.login = async (code) => {
    const config = await getConfig();
    const loginMessage = {
        uuid: config.uuid,
        deviceType: config.type,
        serialId: config.serialId,
        code: code
    }

    let request = JSON.parse(JSON.stringify(requestMessage));
    request.resource = 'login';
    request.payload = loginMessage;
    quicClient.sendRequest(request)
        .then( data => {
            if (data.code === 200){
                //Store Tokens
                try {
                    var tokens = utils.verifyDeviceTokens(data.payload.tokens);
                    log.info("Received tokens verified");
                    device.setDeviceTokens(tokens);
                    //Ready to Publish
                    log.info("Go to state PROVISIONED - Ready to publish");
                    device.setDeviceStatus(2);
                } catch(err) {
                    throw err;
                }
            }
        })
        .catch( err => {
            log.error(err);
            device.setDeviceStatus(0);
        });
}

exports.refreshToken = async () => {
    const config = await getConfig();
    const refreshTokenMessage = {
        uuid: config.uuid,
        deviceType: config.type,
        serialId: config.serialId
    }

    let request = JSON.parse(JSON.stringify(requestMessage));
    request.resource = 'refreshToken';
    request.authentication = db.get('tokens.refreshToken.token').value()
    request.payload = refreshTokenMessage;
    quicClient.sendRequest(request)
        .then( data => {
            if (data.code === 200){
                //Store Tokens
                try {
                    var tokens = utils.verifyDeviceTokens(data.payload.tokens);
                    log.info("New access token received and signaure verified");
                    device.setDeviceTokens(tokens);
                    //Ready to Publish
                    log.info("Go to state PROVISIONED - Ready to publish");
                    device.setDeviceStatus(2);
                } catch(err) {
                    throw err;
                }
            } else if(data.code === 403) {
                log.info("Go to state DISABLED. IDDLE mode until device restart");
                device.setDeviceStatus(5);
            }
        })
        .catch( err => {
            log.error(err)
        });
}

exports.publishMeasure = async () => {
    const config = await getConfig();
    if(device.getDeviceStatus() !== 2) {
        clearInterval(publishInterval);
        publishInterval = null;
        return;
    }
    if(publishInterval === null) {
        log.info("Publishing ...");
        publishInterval = setInterval(()=>{

            const measureMessage = {
                deviceType: config.type,
                uuid: config.uuid,
                measure: utils.randomIntInc(config.lowerLimit, config.upperLimit),
                timestamp: utils.getTime()
            }
            let request = JSON.parse(JSON.stringify(requestMessage));

            request.authentication = db.get('tokens.accessToken.token').value()
            request.resource = 'publishMeasure';
            request.payload = measureMessage;
            log.info("Send measure - " + JSON.stringify(measureMessage));
            quicClient.sendRequest(request)
                .then( data => {
                    if (data.code === 200){
                        log.info("Measure stored - " + data.payload.message);
                    } else if (data.code != 200) {
                        //log.info("Server error received");
                    }
                })
                .catch( err => {
                    log.error(err)
                });
        }, 5000);
    }
}