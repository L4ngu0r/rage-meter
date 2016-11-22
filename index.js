var restify = require("restify"),
    server = restify.createServer({
        name: 'rage-meter',
        version: '1.0.0'
    }),
    crypto = require("crypto");

server.use(restify.bodyParser());
server.use(restify.CORS());

/**********************************
 *
 *  Initialization
 *
 **********************************/

const MAX_RAGE = 10;
const MIN_RAGE = 0;
const BASE_ROUTE = '/rage';

/**
 *
 * @param personId number
 * @returns {*} person
 */
function findPerson(personId) {
    return persons.find((p) => {
        return p.id === personId;
    });
}

function findPersonIndex(personId) {
    return persons.find((p, index) => {
        if(p.id === personId){
            return index;
        }
    });
}

// MOCK
var persons = [
    {name: 'person1', id: 1},
    {name: 'person2', id: 2},
    {name: 'person3', id: 3},
    {name: 'person4', id: 4},
    {name: 'person5', id: 5},
    {name: 'person6', id: 6},
    {name: 'person7', id: 7}
];

persons.map((p) => {
    let rageLevel = 0;
    Object.defineProperties(p, {
        "rageLevel": {
            get: function () {
                return rageLevel;
            },
            set: function (rage) {
                if (rageLevel >= MIN_RAGE && rageLevel <= MAX_RAGE) {
                    rageLevel = rage;
                }
            }
        },
        "nbVote": {
            value: 0,
            writable: true
        }
    });
    return p;
});

var rageMeter = [].concat(persons),
    mapIps = {};

/**********************************
 *
 *  Middleware authentication logic
 *
 **********************************/

function auth(req, res, next) {
    // regex limited to 255
    let idsReg = /\/rage\/([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])/,
        reqPath = req.url,
        reqMethod = req.method,
        reqIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        matches;
    // use of regex to identify if we try to get a person
    if ((matches = idsReg.exec(reqPath)) !== null) {
        if (matches.index === idsReg.lastIndex) {
            idsReg.lastIndex++;
        }
    }
    let ip = null;
    if (reqIp.length < 16) {
        // fallback for ipv6 localhost (::1)
        ip = req.headers.host.split(':')[0];
    } else {
        let ipSplit = reqIp.split(':');
        ip = ipSplit[ipSplit.length - 1];
    }

    if(reqMethod !== 'POST'){
        next();
    }else {
        // check if ip already requested something
        let isPresent = Object.keys(mapIps).find((key) => {
            return key === ip;
        });
        let now = new Date().getTime();
        let accessAdmin = reqPath.indexOf("adm") !== -1;
        if (accessAdmin) {
            let ipTrying = isPresent || ip;
            switch (ipTrying) {
                case "localhost":
                case "::1":
                case "127.0.0.1":
                    next();
                    break;
                default:
                    res.status(401);
                    res.json({'Error': 'Unauthorized request!'});
            }
        } else if (!isPresent) {
            // first time call
            mapIps[ip] = {
                hash: crypto.randomBytes(20).toString("hex"),
                timestamp: now
            };
            next();
        } else if (mapIps[ip].timestamp + 5 * 60 * 1000 > now && matches && reqMethod === 'POST') {
            // we block vote on POST method with regex matches id and for 5 minutes
            // showing the remaining time in the response
            let remainingTime = ((mapIps[ip].timestamp + 5 * 60 * 1000) - now) / 60;
            res.status(401);
            res.json({
                'Warning': 'Too early sorry :)',
                'Time remaining': Math.floor(remainingTime) + 's'
            });
        } else {
            // can get data otherwise, and update timestamp
            mapIps[isPresent].timestamp = now;
            next();
        }
    }
}

server.use(auth);

/**********************************
 *
 *  API - see yaml
 *
 **********************************/

server.get(BASE_ROUTE, (req, res) => {
    res.header('Content-Type', 'application/json');
    res.json(rageMeter);
});

server.get(`${BASE_ROUTE}/:id`, (req, res) => {
    let person = findPerson(parseInt(req.params.id));

    if (person) {
        res.json(person);
    } else {
        res.status(404);
        res.json({});
    }
});


server.post(`${BASE_ROUTE}/:id`, (req, res) => {
    let reqId = parseInt(req.params.id);
    let person = findPerson(reqId);

    if (person) {
        person.nbVote++;
        switch (person.nbVote) {
            case 1:
                res.json({'Vote': 'added'});
                break;
            case 2:
                person.nbVote = 0;
                person.rageLevel++;
                res.json({'Vote': 'added'});
                break;
            default:
                res.json({'Error': 'too much vote'});
        }
    } else {
        res.status(400);
        res.json({'Error': 'id ' + reqId + ' not matching anyone'});
    }
});

/**********************************
 *
 * Admin
 *
 **********************************/

server.post('/adm/add', (req, res) => {
    // add a person to table
    let name = req.params.name;
    if(name) {
        persons.push(new Person(persons.length, name));
        res.json({'Added' : 'Person with name ' + name});
    }else{
        res.status(400);
        res.json({'Error' : 'Please provide a name'});
    }
});

server.put('/adm/update/:id', (req, res) => {
    // update a person
    let person = findPerson(req.params.id);
    if(person){
        //TODO update
    }else{
        res.status(404);
        res.json({'Error' : 'Person with id ' + req.params.id + ' not found'});
    }
});

server.del('/adm/delete/:id', (req, res) => {
    // delete a person
    let personIndex = findPersonIndex(req.params.id);
    if(personIndex){
        persons.splice(personIndex, 1);
        res.json({'Deleted': 'Person with id ' + req.params.id + ' deleted'});
    }else{
        res.status(404);
        res.json({'Error' : 'Person with id ' + req.params.id + ' not found'});
    }
});

server.get(/\/?.*/, restify.serveStatic({
    directory: __dirname + '/doc'
}));

server.listen(8005);
console.log("RAGE API started on port 8005");

module.exports = server;