const path = require('path');
const OSRM = require('osrm');
console.log(OSRM);
const osrm = new OSRM(
  {
    path: '/Users/tonny/Documents/SSD/github/osrm-frontend/data/china-latest.osrm',
    algorithm: 'MLD',
  },
);

const coordinates = [];
coordinates.push([114, 22]);
coordinates.push([114.2, 22.2]);
const query = {
  coordinates,
  alternateRoute: false,
  geometries: 'geojson',
};
osrm.route(query, (err, result) => {
  if (err) console.log('error');
  console.log(result.routes[0].distance);
});
