// Project:  IoT QUIC server
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const device = require('./controller/deviceIoT');
const log = require('./lib/logger').getLogger();
const api = require('./api/api');
const utils = require("./lib/utils");

const startDevice = () => {
  utils.printBanner();
  log.info("#### Device Power On ####");
  device.initDevice();
  runDevice();
}

const runDevice = () => {
  const cicle = setInterval(()=>{
    switch (device.getDeviceStatus()) {
      case 0:
        log.info("NOT_PROVISIONED");
        api.registerDevice();
        break;
      case 1:
        log.info("REGISTERING...");
        break;
      case 2:
        api.publishMeasure();
        break;
      case 3:
        log.info("REFRESHING...");
        api.refreshToken();
        break;
      case 4:
        log.info("PAUSE...");
        break;
      case 5:
        log.info("IDDLE...");
        break;
      default:
        break;
    }
  }, 1000);
}

process.on('SIGTERM', () => {
  log.info('SIGTERM signal received - PowerOff IoT Device');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT signal received - PowerOff IoT Device');
  process.exit(0);
});

startDevice();