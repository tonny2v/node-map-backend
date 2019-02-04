const express = require('express');
const routes = require('./routes');

const app = express();
routes(app);

const server = app.listen(8080, () => {
  const { address, port } = server.address();
  console.log('listening at http://%s:%s', address, port);
});
