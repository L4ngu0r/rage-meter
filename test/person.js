const chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../index'),
    should = chai.should();

chai.use(chaiHttp);

describe('Persons', () => {

  describe('/GET person', () => {
    it('it should GET all the persons', (done) => {
      chai.request(server)
          .get('/rage')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();
          });
    });
  });

  describe('/GET/:id person', () => {
    it('it should GET a person by the given id', (done) => {
      const person = {name:"person1",id:1};
      chai.request(server)
          .get('/rage/1')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('id');
            res.body.should.have.property('id').eql(person.id);
            done();
          });
    });
  });

  describe('/POST/:id', () => {
    it('should POST a vote for a person', (done) => {
      chai.request(server)
          .post('/rage/2')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('Vote');
            res.body.should.have.property('Vote').eql('added');
            done();
          });
    });

    it('should not add a vote for a person before 5 min', (done) => {
      chai.request(server)
          .post('/rage/2')
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('Warning');
            res.body.should.have.property('Warning').eql('Too early sorry :)');
            res.body.should.have.property('Time remaining');
            done();
          });
    })
  });

});