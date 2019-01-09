/* eslint prefer-arrow-callback: [ "error", { "allowUnboundThis": false } ] */
/* eslint-env es6 */

const Router = require('express-promise-router');
const router = new Router();
const path = require('path');
const OSRM = require('osrm');
const zlib = require('zlib');

process.env.UV_THREADPOOL_SIZE = Math.ceil(require('os').cpus().length * 1.5);

module.exports = router;

var osrm = new OSRM(
  {
    path: path.join(__dirname,'../data/china-latest.osrm'),
    algorithm: 'MLD'
  });

// Accepts a query like:
// http://localhost:8081/osrm?start=114.414307,22.521835&end=114.402290,21.523728
// https://github.com/Project-OSRM/osrm-backend/blob/master/docs/nodejs/api.md

router.get('/routing', (req, res) => {
  if (!req.query.start || !req.query.end) {
    return res.json({'error':'invalid start and end query'});
  }
  var coordinates = [];
  var start = req.query.start.split(',');
  coordinates.push([+start[0],+start[1]]);
  var end = req.query.end.split(',');
  coordinates.push([+end[0],+end[1]]);
  var query = {
    coordinates: coordinates,
    alternateRoute: req.query.alternatives !== 'false',
    geometries: 'geojson'
  };
  osrm.route(query, (err, result) => {
    if (err) return res.json({'error':err.message});
    return res.json(result);
  });
});

// http://localhost:8080/osrm/x/y/z
// http://localhost:8080/osrm/3345/1783/12
router.get('/:x/:y/:z', async (req, res) => {
  let options = {
    x: parseInt(req.params.x),
    y: parseInt(req.params.y),
    z: parseInt(req.params.z)
  };
  const {x,y,z} = options;
 
  let vectorTile = await new Promise((resolve, reject)=>{
    osrm.tile([x, y, z], (err, response) => {
      if (err) reject(err);
      else {
        resolve(response);
      }
    });
  });

  let data = await new Promise((resolve, reject) => {
    zlib.deflate(vectorTile, (err, response) => {
      if(err) reject(err);
      resolve(response);
    });
  });
  // return res.status(500);
  res.setHeader('Content-Encoding', 'deflate');
  res.setHeader('Content-Type', 'application/x-protobuf');
  res.send(data);
});

// curl --header "Content-Type: application/json --request POST --data

router.use('/matching', (req, res) => {
  if (req.body) {
    osrm.match(req.body, function(err, result) {
      if (err) throw err;
      console.log(result.tracepoints); // array of Waypoint objects
      console.log(result.matchings); // array of Route objects
      return res.json({'tracepoints': result.tracepoints, 'matchings': result.matchings});
    });
  }
});

