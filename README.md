# Bootstraping de credenciales en dispositivos IoT

El bootstraping de credenciales en dispositivos IoT es uno de los mecanismos más importantes para garantizar la seguridad e integridad de los sistemas IoT.

Este repositorio es una prueba de concepto muy sencilla donde se ha diseñado un sistema muy simple para la distribución y gestión de credenciales en dispositivos IoT, mediante el uso de [QUIC](https://www.chromium.org/quic) como protocolo de transporte, TLS1.3 y JSON web tokens. Debido a la reciente aprobación de QUIC como protocolo por parte de la [IETF](https://datatracker.ietf.org/wg/quic/documents/) y la falta de implementaciones oficiales en los diferentes lenguajes de programación, esta POC incluye muchas limitaciones.

![Logo](https://www.campusciberseguridad.com/images/logos/logo_campus_ciberseguridad_101.png)
[https://www.campusciberseguridad.com/](https://www.campusciberseguridad.com/masters/master-en-ciberseguridad)

## Autores

* Jesús Macias Portela <me@jesusmacias.es>
* Fernando Ruiz Hernandez <fernandotic79@gmail.com>

## Limitaciones

1. Existen una serie de dispositivos registrados previamente en la plataforma mediate su uuid.
2. Los dispositivos están conectados a la red movil y son capaces de recibir SMS.
3. El dispositivo lleva embebido un certificado que usará para establecer la conexión TLS con el servidor. Este certificado es el mismo en todos los dispositivos.
4. El dispositivo lleva embebido una clave pública RSA256 para autenticar los mensajes del servidor.
5. El uso de JWT como mecanismo de tokens por estar estandarizado y la posibilidad de ir firmado y encriptado.
6. La prueba de concepto es unidireccional. El servidor nunca puede iniciar una comunicación hacia el dispositivo.

## IoT QUIC server

1. El servidor se inicia y se pone a la escucha en el puerto 20190 por defecto.
2. Las comunicaciones se inician desde los dispotivos.
3. El servidor envia siguientes comandos a los dispositivos en las respuestas.

## IoT QUIC device

1. El dispositivo se inicia y en la simulación se autoconfigura como uno de los 5 tipos preprovisionados
2. Detecta que no tiene credenciales e inicia un registro contra el servidor enviando su uuid
3. El servidor detecta si es un dispositivo preprovisionado. Si lo es, envia un SMS con un auth code al dispositivo. Si no lo es, el servidor envia un código para que el dispositivo se quede en estado IDLE hasta que lo reinicien.
4. El dispositivo envia una petición de login con su uuid y el auth code. Si es correcto el server le envia un accessToken y un refreshToken. Si no lo es, el servidor envia un código para que el dispositivo se quede en estado IDLE hasta que lo reinicien.
5. El dispositivo empieza a publicar medidas usando el accessToken como credencial. Si el accessToken caduca, el servidor responde con un codigo de token expirado y el dispositivo realiza el proceso de refresco de token. Si todo va bien, se recibe un accessToken nuevo, si no va bien el dispositivo se queda en estado IDLE hasta que lo reinicien.

## Docker

### Start
```
docker-compose up -d
```
### Show logs
```
docker-compose logs -f
```
### Stop
```
docker-compose up -d
```

## Mejoras

* QUIC es un protocolo de transporte sobre el que pueden trabajar otros protocolos:
    * MQTT
    * HTTP3
    * WebSockets
* Deberia ser sencillo migrar aplicaciones actuales que se apoyan en estos protocolos y asi aprovechar las ventajas de QUIC y TLS1.3 para mejorar el rendimiento de los dispositivos

## Referencias

[https://github.com/fidm/quic](https://github.com/fidm/quic)
[https://github.com/Aaronik/node-quic](https://github.com/Aaronik/node-quic)
[https://github.com/Szcnorya/MQTT_on_QUIC](https://github.com/Szcnorya/MQTT_on_QUIC)
[https://blog.cloudflare.com/the-road-to-quic/](https://blog.cloudflare.com/the-road-to-quic/)
[https://medium.com/@siddharthac6/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e](https://medium.com/@siddharthac6/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e)
[https://www.redeszone.net/2018/08/12/tls-1-3-rfc-8446-conoce-mejoras-seguridad-rendimiento/](https://www.redeszone.net/2018/08/12/tls-1-3-rfc-8446-conoce-mejoras-seguridad-rendimiento/)
