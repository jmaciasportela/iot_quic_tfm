// Project:  IoT QUIC Metadevices
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const utils = require('../lib/utils');

const dbPath = utils.getRootPath() + '/db.json';
let adapter;
let db;

exports.NOT_PROVISIONED = 0;
exports.REGISTERING = 1;
exports.PROVISIONED = 2;
exports.REFRESH = 3;
exports.PAUSE = 4;
exports.DISABLED = 5;

exports.getDB = () => {
    if (db) {
        return db;
    }
    return initializeDB();
};

const devices = { validUUID: [
    'ee9f2110-5843-11e9-a9ba-139bd26c8b4b',
    'f09bdb70-5843-11e9-a9ba-139bd26c8b4b',
    'f0f741e0-5843-11e9-a9ba-139bd26c8b4b',
    'f197c7a0-5843-11e9-a9ba-139bd26c8b4b',
    'f1e72020-5843-11e9-a9ba-139bd26c8b4b'
]};

const initializeDB = () => {
    adapter = new FileSync(dbPath);
    db = low(adapter);
    db.defaults(devices).write()
    return db;
};


