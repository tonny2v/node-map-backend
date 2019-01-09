const zlib = require('zlib');
const mapnik = require('mapnik');
const Promise = require('promise');
const SphericalMercator = require('sphericalmercator');
const Router = require('express-promise-router');

const router = new Router();

module.exports = router;

const mercator = new SphericalMercator({
  size: 256, // tile size
});

mapnik.register_default_input_plugins();


function makeVectorTile(options) {
  const extent = mercator.bbox(options.x, options.y, options.z, false, '3857');
  const map = new mapnik.Map(256, 256, '+init=epsg:3857');
  map.extent = extent;

  const layer = new mapnik.Layer(options.layerName);
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
    srid: 4326,
  });
  layer.styles = ['default'];
  map.add_layer(layer);
  return new Promise(((resolve, reject) => {
    const tile = new mapnik.VectorTile(+options.z, +options.x, +options.y);
    map.render(tile, (err, data) => {
      if (err) return reject(err);
      resolve(data.getData());
    });
  }));
}

router.get('/:layerName/:x/:y/:z', (req, res) => {
  const options = {
    x: +req.params.x,
    y: +req.params.y,
    z: +req.params.z,
    layerName: req.params.layerName,
  };
    // console.log(options);
  makeVectorTile(options).then((vectorTile) => {
    zlib.deflate(vectorTile, (err, data) => {
      if (err) return res.status(500).send(err.message);
      res.setHeader('Content-Encoding', 'deflate');
      res.setHeader('Content-Type', 'application/x-protobuf');
      // console.log(data.byteLength);
      res.send(data);
    });
  });
});
