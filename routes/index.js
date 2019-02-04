// ./routes/index.js
const express = require('express');
const pgvt = require('./pgvt');
const osrm = require('./osrm');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use(express.json());

  app.use('/pgvt', pgvt);
  app.use('/osrm', osrm);
  // etc..
};
