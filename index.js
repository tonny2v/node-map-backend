const express = require('express');
const routes = require('./routes');

const app = express();
routes(app);

let server = app.listen(8080, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log('listening at http://%s:%s', host, port);
});
