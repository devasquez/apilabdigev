/**
 * Created by devasquez on 28/09/2016.
 * Updated by fgualim on 08/12/2016
 */
var Joi = require('joi');
var client_cas = require('./cassandra');
var fc = require('./functions');
var cassandra =  require('cassandra-driver');

var serviceController = {};


//------------------------------------------------------------------------------------------------------

serviceController.getQuotaConsuptionByMsisdn = {
    handler: function(req, reply) {

            cquery = "select * from broadband.v_sgsn where msisdn = '"+req.params.msisdn + "' ALLOW FILTERING";
			
            client_cas.execute(cquery, function (err, result) {

              if (typeof result === 'undefined')
                return reply('No data found for msisdn (undefined) : '+req.params.msisdn).code(404);
              else {

                  if (result.rows.length === 0)
                      return reply('No data found for msisdn : '+req.params.msisdn).code(404);
                  else
                  {

					ConsumoDiario='[';

                    for (var i = 0; i < result.rows.length; i++) {

                      consumo = result.rows[i];

						detalleDiario = '{ '
						+ '"date" : "'+ consumo.date + '", '
						+ '"msisdn" : "'+ consumo.msisdn + '", '
						+ '"upload" : "'+ consumo.upload + '", '
						+ '"download" : "'+ consumo.download + '", '						
						+ '"last_update" : "'+ consumo.last_update + '"},';

                      ConsumoDiario=ConsumoDiario+detalleDiario;
                    }

                    ConsumoDiario=ConsumoDiario.slice(0, - 1)+']';

                    return reply(ConsumoDiario);
                  }
              }

            })
    },
    validate: {
        params: {
            msisdn: Joi.string().required()
        }
    }
};


//------------------------------------------------------------------------------------------------------

serviceController.getConsuptionDetailsByMsisdn = {
    handler: function(req, reply) {

            cquery = "select * from broadband.v_dpi_pcrf where msisdn = '"+req.params.msisdn + "' ALLOW FILTERING";
			
            client_cas.execute(cquery, function (err, result) {

              if (typeof result === 'undefined')
                return reply('No data found for msisdn (undefined) : '+req.params.msisdn).code(404);
              else {

                  if (result.rows.length === 0)
                      return reply('No data found for msisdn : '+req.params.msisdn).code(404);
                  else
                  {

					DetalleConsumo='[';

                    for (var i = 0; i < result.rows.length; i++) {

                      consumo = result.rows[i];

						detalleDiario = '{ '
						+ '"date" : "'+ consumo.date + '", '						
						+ '"classification" : "'+ consumo.classification + '", '
						+ '"data" : "'+ consumo.data + '"},';

                      DetalleConsumo=DetalleConsumo+detalleDiario;
                    }

                    DetalleConsumo=DetalleConsumo.slice(0, - 1)+']';

                    return reply(DetalleConsumo);
                  }
              }

            })
    },
    validate: {
        params: {
            msisdn: Joi.string().required()
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
            msisdn: Joi.string().required()
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

                return reply(DetallePromotionsNotFound);
              else {

                  if (result.rows.length === 0)
                      return reply(DetallePromotionsNotFound);
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
            msisdn: Joi.string().required(),
			idpromo: Joi.string().required()
        }
    }
};
//------------------------------------------------------------------------------------------------------
module.exports = [
    {
      path: '/quota/consumption/{msisdn}',
      method: 'GET',
      config: serviceController.getQuotaConsuptionByMsisdn
    },
    {
      path: '/consumption/details/{msisdn}',
      method: 'GET',
      config: serviceController.getConsuptionDetailsByMsisdn
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
