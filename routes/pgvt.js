const zlib = require('zlib');
const mapnik = require('mapnik');
const Promise = require('promise');
const SphericalMercator = require('sphericalmercator');
const Router = require('express-promise-router');
const router = new Router();

module.exports = router;

let mercator = new SphericalMercator({
  size: 256 //tile size
});

mapnik.register_default_input_plugins();

router.get('/:layerName/:x/:y/:z', function(req, res) {
  let options = {
    x: parseInt(req.params.x),
    y: parseInt(req.params.y),
    z: parseInt(req.params.z),
    layerName: req.params.layerName
  };
    // console.log(options);
  makeVectorTile(options).then(function(vectorTile) {
    zlib.deflate(vectorTile, function(err, data) {
      if (err) return res.status(500).send(err.message);
      res.setHeader('Content-Encoding', 'deflate');
      res.setHeader('Content-Type', 'application/x-protobuf');
      // console.log(data.byteLength);
      res.send(data);
    });
  });
});

function makeVectorTile(options) {

  let extent = mercator.bbox(options.x, options.y, options.z, false, '3857');
  let map = new mapnik.Map(256, 256, '+init=epsg:3857');
  map.extent = extent;

  let layer = new mapnik.Layer(options.layerName);
  layer.datasource = new mapnik.Datasource({
    // host, user, ... are optional, since they have been defined in the start script
    host: 'localhost',
    type: 'postgis',
    dbname: 'shenzhen_osm',
    table: options.layerName,
    user: 'tonny',
    port: 5432,
    password: 'password',
    geometry_field: 'geom',
    srid: 4326
  });
  layer.styles = ['default'];
  map.add_layer(layer);
  return new Promise(function (resolve, reject) {
    let vtile = new mapnik.VectorTile(parseInt(options.z), parseInt(options.x), parseInt(options.y));
    map.render(vtile, function (err, vtile) {
      if (err) return reject(err);
      resolve(vtile.getData());
    });
  });
}
