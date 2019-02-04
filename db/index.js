const { Pool } = require('pg');

const pool = Pool();
module.exports = {
  query: (text, params) => pool.query(text, params),
};
