// Project:  IoT QUIC server
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const uuidv1 = require('uuid/v1');
const utils = require('../lib/utils');
const log = require('../lib/logger.js').getLogger();
const db = require('../db/db').getDB();
const IoTDevices = require('../model/deviceType').IoTDevicesTypes;

let device;

exports.initDevice = () => {
    log.info("Initializing device");
    checkDevicePreviousStatus();
    let config = exports.getDeviceConfig();
    if(utils.isEmptyDict(config)) {
        log.info("This is new device. ");
        device = IoTDevices[utils.randomIntInc(0, IoTDevices.length - 1)];
        device.networkId = utils.getIMSI();
        setDeviceConfig(device);
    } else {
        device = config;
    }
    log.info("Reading device info");
    log.info("Device Type: " + device.type);
    log.info("Device Serial: " + device.serialId);
    log.info("Device Identifier: " + device.uuid);
    return device;
}

exports.updateMeasure = () => {
    device.measure = Math.floor(Math.random() * (device.upperLimit - device.lowerLimit + 1) + device.lowerLimit)
    log.info("Type: " + device.type + " -- UUID: " + device.uuid + " -- Measure: " + device.measure );
}

const setDeviceConfig = (device) => {
    log.debug("Set device config -- " + JSON.stringify(device));
    db.set('config', device).write();
}

exports.getDeviceConfig = () => {
    const config = db.get('config').value();
    log.debug("Get device config -- " + JSON.stringify(config));
    return config;
}
exports.setDeviceTokens = (tokens) => {
    db.set('tokens', tokens).write();
}

exports.getDeviceTokens = (state) => {
    return db.get('tokens').value();
}

exports.setDeviceStatus = (state) => {
    log.debug("Set device state to " + state)
    db.set('state', state).write();
}

exports.getDeviceStatus = () => {
    const state = db.get('state').value();
    return state;
}

exports.getDevice = () => {
    return device;
}

checkDevicePreviousStatus = () => {
    if (db.get('state').value() != 2) {
        db.set('state', 0).write();
        db.set('tokens', {}).write();
    };
}

exports.resetDevice = () => {
    db.set('state', 0).write();
    db.set('tokens', {}).write();
}