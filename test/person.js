const chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../index'),
    should = chai.should(),
    dotenv = require('dotenv');

dotenv.config();
chai.use(chaiHttp);

describe('Persons', () => {
  let token = {};
  let persons = [];

  before((done) => {
    chai.request('https://languor.eu.auth0.com/oauth/token')
      .post('/')
      .send({
        'client_id': process.env.AUTH0_API_ID,
        'client_secret': process.env.AUTH0_API_SECRET,
        'audience': process.env.AUTH0_API_AUDIENCE,
        'grant_type': 'client_credentials',
      })
      .end((err, res) => {
        res.should.have.status(200);
        token = res.body.access_token;
        done();
      });
  });

  describe('/GET person', () => {
    it('it should GET all the persons', (done) => {
      chai.request(server)
          .get('/rage')
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
            if (err) {
              throw err;
            }
            persons = res.body;
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(7);
            done();
          });
    });
  });

  describe('/GET/:id person', () => {
    it('it should GET a person by the given id', (done) => {
      const person = persons[0];
      chai.request(server)
          .get(`/rage/${person.id}`)
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
            if (err) {
              throw err;
            }
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
          .post(`/rage/${persons[1].id}`)
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
            if (err) {
              throw err;
            }
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('Vote');
            res.body.should.have.property('Vote').eql('added');
            done();
          });
    });

    it('should not add a vote for a person before 5 min', (done) => {
      chai.request(server)
          .post(`/rage/${persons[1].id}`)
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('Warning');
            res.body.should.have.property('Warning').eql('Too early sorry :)');
            res.body.should.have.property('Time remaining');
            done();
          });
    });
  });
});
