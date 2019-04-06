// Project:  IoT QUIC Metadevices
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const quic = require('node-quic');
const jsscompress = require("js-string-compression");
const utils = require("./lib/utils");
const hm = new jsscompress.Hauffman();

const log = require('./lib/logger').getLogger();
const api = require('./api/api');

const port = process.env.PORT || 20190;
const address = process.env.ADDRESS || "0.0.0.0";
const enableCompression = false;

quic.listen(port, address)
    .then(() => {
        const serverInfo = quic.getAddress();
        utils.printBanner();
        log.info("Server listening on " + serverInfo.address + ":" + serverInfo.port);
    })
    .onData((data, stream, buffer) => {
        const parsedData = enableCompression ? JSON.parse(hm.decompress(data)): JSON.parse(data);
        log.info(parsedData.payload);
        log.debug(parsedData.payload);
        api.getResponse(parsedData)
            .then((response) => {
                log.info(response);
                stream.write(enableCompression ? hm.compress(JSON.stringify(response)) : JSON.stringify(response));
            })
            .catch(err => {
                log.debug(err);
                stream.write(enableCompression ? hm.compress(JSON.stringify(err)) : JSON.stringify(err));
            });
    })
    .onError((error) => {
        log.error(error);
    })

process.on('SIGTERM', () => {
    log.info('SIGTERM signal received - PowerOff IoT Server');
    quic.stopListening()
    process.exit(0);
});

process.on('SIGINT', () => {
    log.info('SIGINT signal received - PowerOff IoT Server');
    quic.stopListening()
    process.exit(0);
});