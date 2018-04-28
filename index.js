const restify = require('restify'),
  jwt = require('express-jwt'),
  jwks = require('jwks-rsa'),
  dotenv = require('dotenv'),
  corsMiddleware = require('restify-cors-middleware'),
  server = restify.createServer({
    name: 'rage-meter',
    version: '1.0.0',
  }),
  auth = require('./middleware/Auth'),
  cors = corsMiddleware({
    origins: [
      'http://localhost:4200',
    ],
  }),
  Rage = require('./model/Rage'),
  RageConfig = require('./model/RageConfig'),
  Person = require('./model/Person');

dotenv.config();

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.AUTH0_JWKS_URI,
  }),
  audience: process.env.AUTH0_API_AUDIENCE,
  issuer: '',
  algorithms: ['RS256'],
});

server.use(restify.plugins.bodyParser());
server.pre(cors.preflight);
server.use(cors.actual);
server.use(auth);

const rageConfig = new RageConfig({
  maxRage: 10,
  minRage: 0,
  baseRoute: '/rage',
  jwtConfig: jwtCheck,
});

let arrayPerson = [
    {name: 'person1'},
    {name: 'person2'},
    {name: 'person3'},
    {name: 'person4'},
    {name: 'person5'},
    {name: 'person6'},
    {name: 'person7'},
];

arrayPerson = arrayPerson.map((p) => {
    return new Person(p.name, 2);
});

const rageMeter = new Rage(arrayPerson, 0, 10, '/rage');

const routes = require('./routes/Routes');
routes(server, rageMeter, rageConfig);

server.listen(8005);
console.log('RAGE API started on port 8005');

module.exports = server;
