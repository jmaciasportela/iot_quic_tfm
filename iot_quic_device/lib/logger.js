// Project:  IoT QUIC server
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const fs = require('fs');
const appRoot = require('app-root-path');
const SimpleNodeLogger = require('simple-node-logger');

const logPath = appRoot + '/logs/device.log';

let log;
const LEVEL = process.env.LOGLEVEL || 'info';

exports.getLogger = () => {
    if (log) {
        return log;
    }
    if (!fs.existsSync(appRoot + '/logs')){
        fs.mkdirSync(appRoot + '/logs');
    }
    const opts = {
        logFilePath: logPath,
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    }
    log = SimpleNodeLogger.createSimpleLogger( opts );

    log.setLevel(LEVEL);
    return log;
};
