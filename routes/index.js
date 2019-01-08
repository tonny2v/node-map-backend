// ./routes/index.js
const pgvt = require('./pgvt');
const osrm = require('./osrm');

module.exports = (app) => {
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use('/pgvt', pgvt);
  app.use('/osrm',osrm);
  // etc..
};
