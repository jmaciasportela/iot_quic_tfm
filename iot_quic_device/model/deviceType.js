// Project:  IoT QUIC server
// Description: TFM - Bootraping de credenciales en dispositivos IoT
// Url: https://github.com/jmaciasportela/iot_quic_tfm
// Reference: https://www.campusciberseguridad.com/
// Date: 2019
// Author: Jesus Macias Portela <me@jesusmacias.es>
// Author: Fernando Ruiz Hernandez <fernandotic79@gmail.com>

const thermometer = {   type: 'thermometer',
                        serialId: "0000000001",
                        uuid: 'ee9f2110-5843-11e9-a9ba-139bd26c8b4b',
                        lowerLimit: -273,
                        upperLimit: 1000,
                        units: 'degrees',
                        measure: 0,
                        networkType: 'Mobile',
                        twoAuthMethods: ['SMS', 'TOTP']
                    }

const lightSensor = {   type: 'lightSensor',
                        serialId: "0000000002",
                        uuid: 'f09bdb70-5843-11e9-a9ba-139bd26c8b4b',
                        lowerLimit: 0,
                        upperLimit: 20000,
                        units: 'lumens',
                        measure: 0,
                        networkType: 'Mobile',
                        twoAuthMethods: ['SMS', 'TOTP']
                    }

const humidityMeter = { type: 'humidityMeter',
                        serialId: "0000000003",
                        uuid: 'f0f741e0-5843-11e9-a9ba-139bd26c8b4b',
                        lowerLimit: 0,
                        upperLimit: 100,
                        units: '%',
                        measure: 0,
                        networkType: 'Mobile',
                        twoAuthMethods: ['SMS', 'TOTP']
                      }

const presenceDetector = {  type: 'presenceDetector',
                            serialId: "0000000004",
                            uuid: 'f197c7a0-5843-11e9-a9ba-139bd26c8b4b',
                            lowerLimit: 0,
                            upperLimit: 1,
                            units: '',
                            measure: 0,
                            networkType: 'Mobile',
                            twoAuthMethods: ['SMS', 'TOTP']
                        }

const windSpeedSensor = {   type: 'windSpeedSensor',
                            serialId: "0000000005",
                            uuid: 'f1e72020-5843-11e9-a9ba-139bd26c8b4b',
                            lowerLimit: 0,
                            upperLimit: 10000,
                            units: 'm/s',
                            measure: 0,
                            networkType: 'Mobile',
                            twoAuthMethods: ['SMS', 'TOTP']
                        }
exports.IoTDevicesTypes = [ thermometer,
                            lightSensor,
                            humidityMeter,
                            presenceDetector,
                            windSpeedSensor
                          ];