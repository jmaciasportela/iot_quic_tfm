// Project:  IoT QUIC Metadevices
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const log = require('../lib/logger').getLogger();
const utils = require('../lib/utils');
const db = require('../db/db').getDB();

const available2AuthMethods = ['SMS', 'EMAIL', 'PUSH', 'TOPT']

const responseMessage = {
    code: null,
    payload: null
}

const registerMessage = {
    serverPublicKey: '123456',
    twoAuthMethod: '',
    deviceConfig: {
        publishInterval: 60
    }
}

const unAuthenticatedMethods = {"registerDevice": true,
                                "login": true
                               };

const registerDeviceResponse = (data) => {
    //Check if UUID is in DB
    const uuids = db.get('validUUID').value();
    if (!uuids.includes(data.uuid)) {
        log.error("UUID " + data.uuid + " not in database");
        return errorMessage(403, "FORBIDDEN");
    }
    //Check 2Auth Methods
    const authMethod = data.validationMethods.find(el => {
                            if(available2AuthMethods.indexOf(el) >= 0) {
                                return true;
                            }
                        });
    log.info(authMethod)
    if (authMethod) {
        // Send 2Auth Code by this method
        // SEND SMS WITH AUTH CODE
    } else {
        log.error("Not available 2 Auth method for UUID " + data.uuid);
        return errorMessage (412, "Precondition Failed");
    }
    //Send Response
    let response = JSON.parse(JSON.stringify(responseMessage));
    response.code = 200;
    response.resource = 'registerDeviceResponse';
    response.payload = registerMessage;
    response.payload.twoAuthMethod = authMethod;
    return response;
}

const loginMessage = {
    tokens: {}
}

const loginResponse = (data) => {
    //Check if 2Auth Code is valid with this UUID
    // checkCode(data.uuid, data.code);
    //Send Response
    // Generate JWT RS256 Tokens
    let accessToken = utils.getToken(data, "1m");
    let refreshToken = utils.getToken(data);

    let response = JSON.parse(JSON.stringify(responseMessage));
    response.code = 200;
    response.resource = 'loginResponse';
    loginMessage.tokens.accessToken = accessToken;
    loginMessage.tokens.refreshToken = refreshToken;
    response.payload = loginMessage;
    return response;
}

const refreshTokenMessage = {
    tokens: {}
}

const refreshResponse = (data) => {
    try {
        utils.verifyRefreshToken(data.authentication);
    } catch (err) {
        // Check which error is
        log.error(err);
        let response = JSON.parse(JSON.stringify(responseMessage));
        response.code = 700;
        response.payload = {message: "NOT PROVISIONED"};
        return response;
    }

    const uuids = db.get('validUUID').value();
    if (!uuids.includes(data.payload.uuid)) {
        log.error("UUID " + data.payload.uuid + " not in database");
        return errorMessage(403, "FORBIDDEN");
    }

    let response = JSON.parse(JSON.stringify(responseMessage));
    response.code = 200;
    response.resource = 'refreshTokenResponse';
    refreshTokenMessage.tokens.accessToken = utils.getToken(data.payload, "1m");
    refreshTokenMessage.tokens.refreshToken = data.authentication;
    response.payload = refreshTokenMessage;
    return response;
}


const errorMessage = (code, message) => {
    let response = JSON.parse(JSON.stringify(responseMessage));
    response.code = code;
    response.payload = {"message": message};
    return response;
}

exports.getResponse = (data) => {
    return new Promise((resolve, reject) => {
        let decoded;
        if (!unAuthenticatedMethods[data.resource]) {
            try {
                decoded = utils.verifyAccessToken(data.authentication);
            } catch (err) {
                // Check which error is
                log.error(err);
                response = JSON.parse(JSON.stringify(responseMessage));
                response.code = 403;
                response.payload = {message: "FORBIDEN"};
                reject(response);
            }
        }
        switch (data.resource) {
            case "registerDevice":
                resolve(registerDeviceResponse(data.payload));
                break
            case "login":
                resolve(loginResponse(data.payload));
                break
            case "publishMeasure":
                log.info("Type: " + decoded.data.deviceType + " UUID: " + decoded.data.uuid);
                response = JSON.parse(JSON.stringify(responseMessage));
                response.code = 200;
                response.payload= {message: "ACK for " + data.payload.timestamp};
                resolve(response);
                break;
            case "refreshToken":
                resolve(refreshResponse(data));
                break;
            default:
                resolve(errorNullMessage(404, "NOT FOUND"));
                break;
            }
    });
}