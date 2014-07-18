goog.provide('net.sf.geographiclib.Interface');

goog.require('goog.asserts');
goog.require('net.sf.geographiclib.GeoMath');
goog.require('net.sf.geographiclib.Geodesic');
goog.require('net.sf.geographiclib.GeodesicLine');
goog.require('net.sf.geographiclib.GeodesicMask');
goog.require('ol.Coordinate');
goog.require('ol.ellipsoid.WGS84');



/**
 * @constructor
 */
net.sf.geographiclib.Interface = function() {
  this.geodesic_ = new net.sf.geographiclib.Geodesic(
      ol.ellipsoid.WGS84.a,
      ol.ellipsoid.WGS84.flattening);
};
goog.addSingletonGetter(net.sf.geographiclib.Interface);


/**
 * @param {!ol.Coordinate} c1 Coordinate 1.
 * @param {!ol.Coordinate} c2 Coordinate 2.
 * @param {!number=} opt_outmask
 * @return {!{distance: number, initialBearing: number, finalBearing: number}}
 */
net.sf.geographiclib.Interface.prototype.inverse =
    function(c1, c2, opt_outmask) {
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  var outmask = goog.isDef(opt_outmask) ? opt_outmask :
      gm.DISTANCE | gm.AZIMUTH;
  var genInverseResult = this.geodesic_.GenInverse(c1[1], c1[0], c2[1], c2[0],
      outmask);
  return {
    distance: genInverseResult.s12,
    initialBearing: genInverseResult.azi1,
    finalBearing: genInverseResult.azi2
  };
};


/**
 * @param {ol.Coordinate} c
 * @param {number} distance
 * @param {number} bearing
 * @param {!number=} opt_outmask
 * @return {ol.Coordinate}
 */
net.sf.geographiclib.Interface.prototype.direct =
    function(c, distance, bearing, opt_outmask) {
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  var outmask = goog.isDef(opt_outmask) ? opt_outmask :
      gm.LATITUDE | gm.LONGITUDE | gm.AZIMUTH;
  var genDirectResult = this.GenDirect(c[1], c[0], bearing, false,
      distance, outmask);
  return [genDirectResult.lon2, genDirectResult.lat2];
};


/**
 * @param {!number} lat1
 * @param {!number} lon1
 * @param {!number} lat2
 * @param {!number} lon2
 * @param {!number} ds12
 * @param {!number} maxk
 * @return {!Array.<!{
 * lat:!number,
 * lng:!number,
 * azi:!number
 * }>}
 */
net.sf.geographiclib.Interface.prototype.InversePath =
    function(lat1, lon1, lat2, lon2, ds12, maxk) {
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  var t = this.Inverse(lat1, lon1, lat2, lon2);
  if (!maxk) maxk = 20;
  goog.asserts.assert(ds12 > 0, 'ds12 must be a positive number');
  var
      k = Math.max(1, Math.min(maxk, Math.ceil(t.s12 / ds12))),
      points = new Array(k + 1);
  points[0] = {
    lat: t.lat1,
    lon: t.lon1,
    azi: t.azi1
  };
  points[k] = {
    lat: t.lat2,
    lon: t.lon2,
    azi: t.azi2
  };
  if (k > 1) {
    var line = new net.sf.geographiclib.GeodesicLine(
        this.geodesic_, t.lat1, t.lon1, t.azi1,
        gm.LATITUDE | gm.LONGITUDE | gm.AZIMUTH),
        da12 = t.a12 / k;
    var vals;
    for (var i = 1; i < k; ++i) {
      vals =
          line.GenPosition(true, i * da12,
          gm.LATITUDE | gm.LONGITUDE | gm.AZIMUTH);
      points[i] = {
        lat: vals.lat2,
        lon: vals.lon2,
        azi: vals.azi2
      };
    }
  }
  return points;
};


/**
 * @param {!number} lat1
 * @param {!number} lon1
 * @param {!number} azi1
 * @param {!number} s12
 * @param {!number} ds12
 * @param {!number} maxk
 * @return {!Array.<!{
 * lat:!number,
 * lng:!number,
 * azi:!number
 * }>}
 */
net.sf.geographiclib.Interface.prototype.DirectPath =
    function(lat1, lon1, azi1, s12, ds12, maxk) {
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  var t = this.Direct(lat1, lon1, azi1, s12);
  if (!maxk) maxk = 20;
  goog.asserts.assert(ds12 > 0, 'ds12 must be a positive number');
  var
      k = Math.max(1, Math.min(maxk, Math.ceil(Math.abs(t.s12) / ds12))),
      points = new Array(k + 1);
  points[0] = {
    lat: t.lat1,
    lon: t.lon1,
    azi: t.azi1
  };
  points[k] = {
    lat: t.lat2,
    lon: t.lon2,
    azi: t.azi2
  };
  if (k > 1) {
    var line = new net.sf.geographiclib.GeodesicLine(
        this.geodesic_, t.lat1, t.lon1, t.azi1,
        gm.LATITUDE | gm.LONGITUDE | gm.AZIMUTH),
        da12 = t.a12 / k;
    var vals;
    for (var i = 1; i < k; ++i) {
      vals =
          line.GenPosition(true, i * da12,
          gm.LATITUDE | gm.LONGITUDE | gm.AZIMUTH);
      points[i] = {
        lat: vals.lat2,
        lon: vals.lon2,
        azi: vals.azi2
      };
    }
  }
  return points;
};


/**
 * @param {!number} lat1
 * @param {!number} lon1
 * @param {!number} azi1
 * @param {!number} s12
 * @param {!number} k
 * @return {!Array.<!{
 * lat:!number,
 * lon:!number
 * }>}
 */
net.sf.geographiclib.Interface.prototype.Circle =
    function(lat1, lon1, azi1, s12, k) {
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  goog.asserts.assert(Math.abs(lat1) <= 90, 'lat1 must be in [-90, 90]');
  goog.asserts.assert(lon1 >= -540 && lon1 < 540,
      'lon1 must be in [-540, 540)');
  goog.asserts.assert(azi1 >= -540 && azi1 < 540,
      'azi1 must be in [-540, 540)');
  goog.asserts.assert(isFinite(s12), 's12 must be a finite number');
  lon1 = net.sf.geographiclib.GeoMath.angNormalize(lon1);
  azi1 = net.sf.geographiclib.GeoMath.angNormalize(azi1);
  if (!k || k < 4) k = 24;
  var points = new Array(k + 1);
  var vals;
  for (var i = 0; i <= k; ++i) {
    var azi1a = azi1 + (k - i) * 360 / k;
    if (azi1a >= 180) azi1a -= 360;
    vals =
        this.GenDirect(lat1, lon1, azi1a,
        false, s12, gm.LATITUDE | gm.LONGITUDE);
    points[i] = {
      lat: vals.lat2,
      lon: vals.lon2
    };
  }
  return points;
};


/**
 * @param {!number} lat1
 * @param {!number} lon1
 * @param {!number} azi1
 * @param {!boolean} arcmode
 * @param {!number} s12_a12
 * @param {!number} outmask
 * @return {!{
 * a12:!number,
 * s12:!number,
 * lon2:!number,
 * lat2:!number,
 * azi2:!number,
 * m12:!number,
 * M12:!number,
 * M21:!number
 * }}
 */
net.sf.geographiclib.Interface.prototype.GenDirect =
    function(lat1, lon1, azi1, arcmode, s12_a12, outmask) {
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  var line = new net.sf.geographiclib.GeodesicLine(
      this.geodesic_, lat1, lon1, azi1,
      outmask | (arcmode ? gm.NONE : gm.DISTANCE_IN));
  return line.GenPosition(arcmode, s12_a12, outmask);
};


/**
 * @param {!number} lat1
 * @param {!number} lon1
 * @param {!number} k
 * @param {!number} ord
 * @return {!Array.<!{
 * lat:!number,
 * lon:!number
 * }>}
 */
net.sf.geographiclib.Interface.prototype.Envelope =
    function(lat1, lon1, k, ord) {
  goog.asserts.assert(Math.abs(lat1) <= 90,
      'lat1 must be in [-90, 90]');
  goog.asserts.assert(lon1 >= -540 && lon1 < 540,
      'lon1 must be in [-540, 540)');
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  lon1 = net.sf.geographiclib.GeoMath.angNormalize(lon1);
  if (!k || k < 4) k = 24;
  if (!ord) ord = 1;
  var points = new Array(k + 1);
  var vals, line, s12 = 0, j;
  for (var i = 0; i <= k; ++i) {
    var azi1 = -180 + i * 360 / k;
    line = new net.sf.geographiclib.GeodesicLine(
        this.geodesic_, lat1, lon1, azi1,
        gm.LATITUDE | gm.LONGITUDE | gm.DISTANCE_IN |
        gm.DISTANCE | gm.REDUCEDLENGTH | gm.GEODESICSCALE);
    vals = line.GenPosition(true, 180 * ord,
                            gm.DISTANCE | gm.REDUCEDLENGTH | gm.GEODESICSCALE);
    j = 0;
    while (true) {
      s12 = vals.s12 - vals.m12 / vals.M21;
      if (Math.abs(vals.m12) < line._a *
          net.sf.geographiclib.Accuracy.getInstance().tol2() * 0.1 || ++j > 10)
        break;
      vals = line.GenPosition(false, s12,
                              gm.DISTANCE | gm.REDUCEDLENGTH |
                              gm.GEODESICSCALE);
    }
    vals = line.GenPosition(false, s12, gm.LATITUDE | gm.LONGITUDE);
    points[i] = {
      lat: vals.lat2,
      lon: vals.lon2
    };
  }
  return points;
};
