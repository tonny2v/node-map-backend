const { Pool } = require('pg');

let pool = Pool();
module.exports = {
  query: (text, params) => pool.query(text, params)
};
