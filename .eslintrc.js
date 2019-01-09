module.exports = {
  "extends": "airbnb",
  "plugins": [
    "mocha"
  ],
  "rules": {
    "mocha/no-exclusive-tests": "error"
  },
  "env": {
    "commonjs": true,
    "node": true,
    "mocha": true
  }
};

