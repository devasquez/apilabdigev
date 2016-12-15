/**
 * Created by devasquez on 28/09/2016.
 * Updated by fgualim on 08/12/2016  (Whitelist APIs Definition)
 * Updated by devasquez on 14/12/16  (Consumption API Definition)
 */
var Joi = require('joi');
var client_cas = require('./cassandra');
var fc = require('./functions');
var cassandra =  require('cassandra-driver');

var types = ['YouTube, Video y Streaming','Facebook y otras redes sociales','Descargas y transferencias de Archivos','Correo, Navegaci&#243;n y otros', 'Mensajer&#237;a instant&#225;nea'];

//Factor de conversion de Gigabyes a bytes
const factor = 1073741824;

var serviceController = {};


//------------------------------------------------------------------------------------------------------
//FUNCIÓN QUE CONVIERTE A FORMATO DE FECHA YYYY-MM-DD + HORA + ZONA HORARIA, SI ES NECESARIO
function getFormattedDate(parm, parm2) {
    var date = new Date(parm);

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;

    if (parm2 === 0) {
        var str = date.getFullYear() + "-" + month + "-" + day + "T" +  hour + ":" + min + ":" + sec +"-06:00";      
    }
    else{
        var str = date.getFullYear() + "-" + month + "-" + day;      
    }
    
    return str;
}



//------------------------------------------------------------------------------------------------------
serviceController.getConsumptionDetailsForMSISDN = {
    handler: function(req, reply) {

        var acumuladores = [0, 0, 0, 0, 0];
        var fechas = [0, 0, 0, 0, 0];
        var d = new Date();
        
        if (req.query.end_date < req.query.start_date){
            
            return reply('Invalid date query').code(404); 
            
        }
        
        //DEFINICIÓN DE CONSULTA , POR MSISDN Y POR RANGO DE FECHAS
            //console.log('Inicio: ' + new Date().toTimeString());
            cquery = "select * from broadband.v_dpi_pcrf where msisdn = '" +req.params.msisdn + "' "
                + " and date >= '" + getFormattedDate(req.query.start_date, 1) + "'"
                + " and date <= '" + getFormattedDate(req.query.end_date, 1)   + "' ALLOW FILTERING";
            
            
            //console.log(cquery);
            

            //EJECUCIÓN DE QUERY
            
            client_cas.execute(cquery, function (err, result) {

              if (typeof result !== 'undefined')
              
              {

                  if (result.rows.length !== 0)
                  {

                  
                    //SUMATORIA DE VALORES EN VECTOR DE CLASIFICACIONES
                    for (var i = 0; i < result.rows.length; i++) {
                        
                        //console.log(result.rows[i].classification);
                        //console.log(result.rows[i].data);    

                        
                        switch (result.rows[i].classification){
                        
                            case 'YouTube, Video y Streaming':
                                acumuladores[0] += result.rows[i].data;
                                fechas[0] = result.rows[i].last_update;
                                break;
                            case  'Facebook y otras redes sociales':
                                acumuladores[1] += result.rows[i].data;
                                fechas[1] = result.rows[i].last_update;
                                break;
                            case 'Descargas y transferencias de Archivos':
                                acumuladores[2] += result.rows[i].data;
                                fechas[2] = result.rows[i].last_update;
                                break;
                            case 'Correo, Navegaci&#243;n y otros':
                                acumuladores[3] += result.rows[i].data;
                                fechas[3] = result.rows[i].last_update;
                                break;
                            case 'Mensajer&#237;a instant&#225;nea':
                                acumuladores[4] += result.rows[i].data;
                                fechas[4] = result.rows[i].last_update;
                                break;                                
                                
                        }                           
                    }
                      
                      
                      //CONSTRUCCIÓN DE MENSAJE JSON DE RESPUESTA
                        dataSummary = ' { "dataSummary" :[';
                  
                        for (var j = 0; j < 5; j++) {
                            
                            d.setTime(fechas[j]);

                            jsonItem = '{ '
                                + '"classification" : "'+ types[j] + '", '
                                + '"bytes" : "'+ acumuladores[j]*factor + '", ' //por que la información de la BDD viene en GB
                                + '"lastUpdated" : "'+ getFormattedDate(d, 0) + '"},';
                            //console.log(jsonItem);
                            dataSummary = dataSummary + jsonItem;
                            //console.log(dataSummary);
                        }
                  
                        dataSummary=dataSummary.slice(0, - 1)+']}';
                
                        //PRINT DE MENSAJE JSON CON RESULTADO  
                        //console.log(dataSummary);
                        //console.log(fechas);
                        //console.log('Fin: ' + new Date().toTimeString());  
                        
                      //Limpieza de Variables
                        acumuladores = [0, 0, 0, 0, 0];  
                        fechas = [0, 0, 0, 0, 0]
                        d = null;
                      
                      //Callback de función de consulta
                        return reply(dataSummary);   
                                  
                  }
                  else
                      {
                          return reply('No data found for msisdn : '+req.params.msisdn).code(404);
                      }            
            } 
            else {
                return reply('Could not perform query').code(404);
            }
                  
                              
            })
            // FIN DE EJECUCIÓN DE QUERY  
    
        
    },
    validate: {
        params: {
            //msisdn: Joi.string().required();
            msisdn: Joi.number().integer().min(50200000000).max(50299999999).required()
            },
        query: {
            start_date: Joi.date().format('YYYY-MM-DD').required(),
            end_date: Joi.date().format('YYYY-MM-DD').required()
        }
    }
};

//------------------------------------------------------------------------------------------------------

serviceController.getPromotionsByMsisdn = {
    handler: function(req, reply) {

            cquery = "select * from whitelist.whitelist_by_msisdn where msisdn ='"+req.params.msisdn + "' ALLOW FILTERING";
			
            client_cas.execute(cquery, function (err, result) {

              if (typeof result === 'undefined')
                return reply('No data found for msisdn (undefined) : '+req.params.msisdn).code(404);
              else {

                  if (result.rows.length === 0)
                      return reply('No data found for msisdn : '+req.params.msisdn).code(404);
                  else
                  {

					DetallePromotions='{"promotions":[';

                    for (var i = 0; i < result.rows.length; i++) {

                      consumo = result.rows[i];

						detalleDiario = ''+ consumo.set_promo + ',';

                      DetallePromotions=DetallePromotions+detalleDiario;
                    }

                    DetallePromotions=DetallePromotions.slice(0, - 1)+']}';

                    return reply(DetallePromotions);
                  }
              }

            })
    },
    validate: {
        params: {
            msisdn: Joi.number().integer().min(50200000000).max(50299999999).required()
        }
    }
};


//------------------------------------------------------------------------------------------------------

serviceController.getPromotionsByMsisdnPromo = {
    handler: function(req, reply) {

			cquery = "select * from whitelist.whitelist_by_promo where msisdn = '"+req.params.msisdn + "' and promo = "+ req.params.idpromo + " ALLOW FILTERING";
            client_cas.execute(cquery, function (err, result) {
			
			DetallePromotionsNotFound='{"promotions" : [{ '
						+ '"msisdn" : "'+ req.params.msisdn + '", '						
						+ '"promoid" : "'+ req.params.idpromo + '", '
						+ '"result" : "false"}]}';
						
              if (typeof result === 'undefined')

                return reply('Could not perform query.').code(404);
              else {

                  if (result.rows.length === 0)
                      return reply(DetallePromotionsNotFound).code(404);
                  else
                  {

					DetallePromotions='{"promotions" : [';

                    for (var i = 0; i < result.rows.length; i++) {

                      consumo = result.rows[i];

						detalleDiario = '{ '
						+ '"msisdn" : "'+ req.params.msisdn + '", '						
						+ '"promoid" : "'+ req.params.idpromo + '", '
						+ '"result" : "true"},';

                      DetallePromotions=DetallePromotions+detalleDiario;
                    }

                    DetallePromotions=DetallePromotions.slice(0, - 1)+']}';

                    return reply(DetallePromotions);
                  }
              }

            })
    },
    validate: {
        params: {
            msisdn: Joi.number().integer().min(50200000000).max(50299999999).required(),
			idpromo: Joi.number().integer().required()
        }
    }
};
//------------------------------------------------------------------------------------------------------
module.exports = [
    {
      path: '/v1/tigo/mobile/gt/subscribers/{msisdn}/usage/data',
      method: 'GET',
      config: serviceController.getConsumptionDetailsForMSISDN
    },
	{
      path: '/v1/tigo/mobile/gt/subscribers/{msisdn}/promotions',
      method: 'GET',
      config: serviceController.getPromotionsByMsisdn
    },
    {
      path: '/v1/tigo/mobile/gt/subscribers/{msisdn}/promotions/{idpromo}',
      method: 'GET',
      config: serviceController.getPromotionsByMsisdnPromo
    }
];
