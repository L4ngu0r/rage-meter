/**
 *
 * @param {object} server
 * @param {module.Rage} rage
 * @param {module.RageConfig} rageConfig
 * @param {Router} routerInstance
 */
module.exports = function Routes(server, rage, rageConfig) {
  server.get(rage.baseRoute, rageConfig.jwtConfig, (req, res) => {
    res.header('Content-Type', 'application/json');
    res.json(rage.persons);
  });

  server.get(`${rage.baseRoute}/:id`, rageConfig.jwtConfig, (req, res) => {
    let person = rage.findPersonById(req.params.id);

    if (person) {
      res.json(person);
    } else {
      res.status(404);
      res.json({});
    }
  });


  server.post(`${rage.baseRoute}/:id`, rageConfig.jwtConfig, (req, res) => {
    let person = rage.findPersonById(req.params.id);

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
      res.json({'Error': 'id ' + req.params.id + ' not matching anyone'});
    }
  });

};
