const crypto = require('crypto');
let mapIps = {};

/**
 *
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
module.exports = function Auth(req, res, next) {
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

  if (reqMethod !== 'POST') {
    next();
  } else {
    // check if ip already requested something
    let isPresent = Object.keys(mapIps).find((key) => {
      return key === ip;
    });
    let now = new Date().getTime();
    let accessAdmin = reqPath.indexOf('adm') !== -1;
    if (accessAdmin) {
      let ipTrying = isPresent || ip;
      switch (ipTrying) {
        case 'localhost':
        case '::1':
        case '127.0.0.1':
          next();
          break;
        default:
          res.status(401);
          res.json({'Error': 'Unauthorized request!'});
      }
    } else if (!isPresent) {
      // first time call
      mapIps[ip] = {
        hash: crypto.randomBytes(20).toString('hex'),
        timestamp: now,
      };
      next();
    } else if (mapIps[ip].timestamp + 5 * 60 * 1000 > now && matches && reqMethod === 'POST') {
      // we block vote on POST method with regex matches id and for 5 minutes
      // showing the remaining time in the response
      let remainingTime = ((mapIps[ip].timestamp + 5 * 60 * 1000) - now) / 60;
      res.status(401);
      res.json({
        'Warning': 'Too early sorry :)',
        'Time remaining': Math.floor(remainingTime) + 's',
      });
    } else {
      // can get data otherwise, and update timestamp
      mapIps[isPresent].timestamp = now;
      next();
    }
  }
};
