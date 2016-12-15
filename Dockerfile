# DIGITAL EVOLUTION
# E2E SERVICES TIGO
# DOCKERFILES PROJECT
# --------------------------
#Seleccionamos la imagen base
FROM erickeliseo/centosfornodejs:latest

#Descargamos los fuentes de la aplicacion
WORKDIR /tmp
RUN wget https://github.com/devasquez/apilabdigev/archive/master.zip && \
    unzip master.zip && \
    cd /tmp/apilabdigev-master/ && \
    mkdir -p /usr/src/app && \
    cp -r /tmp/apilabdigev-master/* /usr/src/app/

#Instalamos las dependencias
WORKDIR /usr/src/app
RUN npm install

#Eliminado el directorio temporal
#RUN rm -fR /tmp/demoapp-master/

#Exposicion de puerto publico que usara la aplicacion
EXPOSE 3000

#Iniciar aplicacion
CMD [ "node", "server.js" ]