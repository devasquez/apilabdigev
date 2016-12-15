//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Services', () => {
  /*
  * Test the /GET promotions success
  */
  describe('/GET promotions success', () => {
      it('Debe retornar un JSON con las promociones disponibles para el msisdn 50248802504', (done) => {
        chai.request('localhost:3000')
            .get('/v1/tigo/mobile/gt/subscribers/50248802504/promotions')
            .end((err, res) => {
              res.should.have.status(200);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.should.have.property('promotions');
              res.body.promotions.should.be.an.instanceOf(Array);
              done();
            });
      });
  });
 /*
  * Test the /GET promotions fail
  */
  describe('/GET promotions fail', () => {
      it('Debe retornar un JSON que informe que no existen promociones para el msisdn 50248804', (done) => {
        chai.request('localhost:3000')
            .get('/v1/tigo/mobile/gt/subscribers/50248802504/promotions')
            .end((err, res) => {
              res.should.have.status(200);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.should.have.property('fail');
              res.body.promotions.should.be.an.instanceOf(String);
              done();
            });
      });
  });

  /*
  * Test the /GET promotions fail
  */
  describe('/GET promotions', () => {
      it('Debe retornar un JSON que informe que no existen promociones para el msisdn 50248804', (done) => {
        chai.request('localhost:3000')
            .get('/v1/tigo/mobile/gt/subscribers/50248802504/promotions')
            .end((err, res) => {
              res.should.have.status(200);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.should.have.property('fail');
              res.body.promotions.should.be.an.instanceOf(Boolean);
              res.body.promotions.should.equal(false);
              done();
            });
      });
  });
});