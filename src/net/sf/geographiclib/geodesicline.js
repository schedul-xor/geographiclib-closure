goog.provide('net.sf.geographiclib.GeodesicLine');

goog.require('net.sf.geographiclib.Accuracy');
goog.require('net.sf.geographiclib.GeoMath');
goog.require('net.sf.geographiclib.Geodesic');
goog.require('net.sf.geographiclib.GeodesicMask');



/**
 * @constructor
 * @param {!net.sf.geographiclib.Geodesic} geod
 * @param {!number} lat1
 * @param {!number} lon1
 * @param {!number} azi1
 * @param {!number} caps
 */
net.sf.geographiclib.GeodesicLine = function(geod, lat1, lon1, azi1, caps) {
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  var ac = net.sf.geographiclib.Accuracy.getInstance();
  this._a = geod._a;
  this._f = geod._f;
  this._b = geod._b;
  this._c2 = geod._c2;
  this._f1 = geod._f1;
  this._caps = !caps ? gm.ALL : (caps |
      gm.LATITUDE |
      gm.AZIMUTH);
  azi1 = net.sf.geographiclib.Geodesic.AngRound(
      net.sf.geographiclib.GeoMath.angNormalize(azi1));
  lon1 = net.sf.geographiclib.GeoMath.angNormalize(lon1);
  this._lat1 = lat1;
  this._lon1 = lon1;
  this._azi1 = azi1;
  var alp1 = azi1 * net.sf.geographiclib.GeoMath.degree;
  this._salp1 = azi1 == -180 ? 0 : Math.sin(alp1);
  this._calp1 = Math.abs(azi1) == 90 ? 0 : Math.cos(alp1);
  var cbet1, sbet1, phi;
  phi = lat1 * net.sf.geographiclib.GeoMath.degree;
  sbet1 = this._f1 * Math.sin(phi);
  cbet1 = Math.abs(lat1) == 90 ?
      ac.tiny() :
      Math.cos(phi);
  var t = net.sf.geographiclib.GeoMath.hypot(sbet1, cbet1);
  sbet1 /= t;
  cbet1 /= t;
  this._dn1 = Math.sqrt(1 + geod._ep2 *
                        net.sf.geographiclib.GeoMath.sq(sbet1));
  this._salp0 = this._salp1 * cbet1;
  this._calp0 = net.sf.geographiclib.GeoMath.hypot(
      this._calp1, this._salp1 * sbet1);
  this._ssig1 = sbet1;
  this._somg1 = this._salp0 * sbet1;
  this._csig1 = this._comg1 =
      sbet1 != 0 || this._calp1 != 0 ? cbet1 * this._calp1 : 1;
  t = net.sf.geographiclib.GeoMath.hypot(this._ssig1, this._csig1);
  this._ssig1 /= t;
  this._csig1 /= t;
  this._k2 = net.sf.geographiclib.GeoMath.sq(this._calp0) * geod._ep2;
  var eps = this._k2 / (2 * (1 + Math.sqrt(1 + this._k2)) + this._k2);
  if (this._caps & gm.CAP_C1) {
    this._A1m1 = net.sf.geographiclib.Geodesic.A1m1f(eps);
    this._C1a = new Array(ac.nc1() + 1);
    net.sf.geographiclib.Geodesic.C1f(eps, this._C1a);
    this._B11 = net.sf.geographiclib.Geodesic.SinCosSeries(
        true, this._ssig1, this._csig1,
        this._C1a, ac.nc1());
    var s = Math.sin(this._B11),
                c = Math.cos(this._B11);
    this._stau1 = this._ssig1 * c + this._csig1 * s;
    this._ctau1 = this._csig1 * c - this._ssig1 * s;
  }
  if (this._caps & gm.CAP_C1p) {
    this._C1pa = new Array(ac.nc1p() + 1),
    net.sf.geographiclib.Geodesic.C1pf(eps, this._C1pa);
  }
  if (this._caps & gm.CAP_C2) {
    this._A2m1 = net.sf.geographiclib.Geodesic.A2m1f(eps);
    this._C2a = new Array(ac.nc2() + 1);
    net.sf.geographiclib.Geodesic.C2f(eps, this._C2a);
    this._B21 = net.sf.geographiclib.Geodesic.SinCosSeries(
        true, this._ssig1, this._csig1,
        this._C2a, ac.nc2());
  }
  if (this._caps & gm.CAP_C3) {
    this._C3a = new Array(ac.nc3());
    geod.C3f(eps, this._C3a);
    this._A3c = -this._f * this._salp0 * geod.A3f(eps);
    this._B31 = net.sf.geographiclib.Geodesic.SinCosSeries(
        true, this._ssig1, this._csig1,
        this._C3a, ac.nc3() - 1);
  }
  if (this._caps & gm.CAP_C4) {
    this._C4a = new Array(ac.nc4());
    geod.C4f(eps, this._C4a);
    this._A4 = net.sf.geographiclib.GeoMath.sq(this._a) *
        this._calp0 * this._salp0 * geod._e2;
    this._B41 = net.sf.geographiclib.Geodesic.SinCosSeries(
        false, this._ssig1, this._csig1,
        this._C4a, ac.nc4());
  }
};


/**
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
net.sf.geographiclib.GeodesicLine.prototype.GenPosition =
    function(arcmode, s12_a12, outmask) {
  var gm = net.sf.geographiclib.GeodesicMask.getInstance();
  var ac = net.sf.geographiclib.Accuracy.getInstance();
  var vals = {a12: 0, s12: 0, lon2: 0, lat2: 0,
    azi2: 0, m12: 0, M12: 0, M21: 0};
  outmask &= this._caps & gm.OUT_ALL;
  if (!(arcmode || (this._caps & gm.DISTANCE_IN & gm.OUT_ALL))) {
    vals.a12 = Number.NaN;
    return vals;
  }
  var sig12, ssig12, csig12, B12 = 0,
      AB1 = 0;
  if (arcmode) {
    sig12 = s12_a12 * net.sf.geographiclib.GeoMath.degree;
    var s12a = Math.abs(s12_a12);
    s12a -= 180 * Math.floor(s12a / 180);
    ssig12 = s12a == 0 ? 0 : Math.sin(sig12);
    csig12 = s12a == 90 ? 0 : Math.cos(sig12);
  } else {
    var
        tau12 = s12_a12 / (this._b * (1 + this._A1m1)),
                s = Math.sin(tau12),
                c = Math.cos(tau12);
    B12 = -net.sf.geographiclib.Geodesic.SinCosSeries(true,
        this._stau1 * c + this._ctau1 * s,
        this._ctau1 * c - this._stau1 * s,
        this._C1pa, ac.nc1p());
    sig12 = tau12 - (B12 - this._B11);
    ssig12 = Math.sin(sig12);
    csig12 = Math.cos(sig12);
    if (Math.abs(this._f) > 0.01) {
      var
          ssig2 = this._ssig1 * csig12 + this._csig1 * ssig12,
          csig2 = this._csig1 * csig12 - this._ssig1 * ssig12;
      B12 = net.sf.geographiclib.Geodesic.SinCosSeries(
          true, ssig2, csig2, this._C1a, ac.nc1());
      var serr = (1 + this._A1m1) * (sig12 + (B12 - this._B11)) -
          s12_a12 / this._b;
      sig12 = sig12 - serr / Math.sqrt(1 + this._k2 *
                                       net.sf.geographiclib.GeoMath.sq(ssig2));
      ssig12 = Math.sin(sig12);
      csig12 = Math.cos(sig12);
    }
  }
  var omg12, lam12, lon12;
  var ssig2, csig2, sbet2, cbet2, somg2, comg2, salp2, calp2;
  ssig2 = this._ssig1 * csig12 + this._csig1 * ssig12;
  csig2 = this._csig1 * csig12 - this._ssig1 * ssig12;
  var dn2 = Math.sqrt(1 + this._k2 * net.sf.geographiclib.GeoMath.sq(ssig2));
  if (outmask & (gm.DISTANCE | gm.REDUCEDLENGTH | gm.GEODESICSCALE)) {
    if (arcmode || Math.abs(this._f) > 0.01)
      B12 = net.sf.geographiclib.Geodesic.SinCosSeries(
          true, ssig2, csig2, this._C1a, ac.nc1());
    AB1 = (1 + this._A1m1) * (B12 - this._B11);
  }
  sbet2 = this._calp0 * ssig2;
  cbet2 = net.sf.geographiclib.GeoMath.hypot(
      this._salp0, this._calp0 * csig2);
  if (cbet2 == 0)
    cbet2 = csig2 = ac.tiny();
  somg2 = this._salp0 * ssig2;
  comg2 = csig2;
  salp2 = this._salp0;
  calp2 = this._calp0 * csig2;
  omg12 = Math.atan2(somg2 * this._comg1 - comg2 * this._somg1,
      comg2 * this._comg1 + somg2 * this._somg1);
  if (outmask & gm.DISTANCE)
    vals.s12 = arcmode ? this._b * ((1 + this._A1m1) * sig12 + AB1) : s12_a12;
  if (outmask & gm.LONGITUDE) {
    lam12 = omg12 + this._A3c *
        (sig12 + (net.sf.geographiclib.Geodesic.SinCosSeries(
        true, ssig2, csig2, this._C3a, ac.nc3() - 1) - this._B31));
    lon12 = lam12 / net.sf.geographiclib.GeoMath.degree;
    lon12 = net.sf.geographiclib.GeoMath.angNormalize2(lon12);
    vals.lon2 = net.sf.geographiclib.GeoMath.angNormalize(
        this._lon1 + lon12);
  }
  if (outmask & gm.LATITUDE)
    vals.lat2 = Math.atan2(sbet2, this._f1 * cbet2) /
        net.sf.geographiclib.GeoMath.degree;
  if (outmask & gm.AZIMUTH)
    vals.azi2 = 0 - Math.atan2(-salp2, calp2) /
        net.sf.geographiclib.GeoMath.degree;
  if (outmask & (gm.REDUCEDLENGTH | gm.GEODESICSCALE)) {
    var
        B22 = net.sf.geographiclib.Geodesic.SinCosSeries(
        true, ssig2, csig2, this._C2a, ac.nc2()),
                AB2 = (1 + this._A2m1) * (B22 - this._B21),
                J12 = (this._A1m1 - this._A2m1) * sig12 + (AB1 - AB2);
    if (outmask & gm.REDUCEDLENGTH)
      vals.m12 = this._b * ((dn2 * (this._csig1 * ssig2) -
          this._dn1 * (this._ssig1 * csig2)) - this._csig1 * csig2 * J12);
    if (outmask & gm.GEODESICSCALE) {
      var t = this._k2 * (ssig2 - this._ssig1) * (ssig2 + this._ssig1) /
          (this._dn1 + dn2);
      vals.M12 = csig12 + (t * ssig2 - csig2 * J12) * this._ssig1 / this._dn1;
      vals.M21 = csig12 - (t * this._ssig1 - this._csig1 * J12) * ssig2 / dn2;
    }
  }
  if (outmask & gm.AREA) {
    var
        B42 = net.sf.geographiclib.Geodesic.SinCosSeries(
        false, ssig2, csig2, this._C4a, ac.nc4());
    var salp12, calp12;
    if (this._calp0 == 0 || this._salp0 == 0) {
      salp12 = salp2 * this._calp1 - calp2 * this._salp1;
      calp12 = calp2 * this._calp1 + salp2 * this._salp1;
      if (salp12 == 0 && calp12 < 0) {
        salp12 = ac.tiny() * this._calp1;
        calp12 = -1;
      }
    } else {
      salp12 = this._calp0 * this._salp0 *
          (csig12 <= 0 ? this._csig1 * (1 - csig12) + ssig12 * this._ssig1 :
          ssig12 * (this._csig1 * ssig12 / (1 + csig12) + this._ssig1));
      calp12 = net.sf.geographiclib.GeoMath.sq(this._salp0) +
          net.sf.geographiclib.GeoMath.sq(this._calp0) *
          this._csig1 * csig2;
    }
    vals.S12 = this._c2 * Math.atan2(salp12, calp12) +
        this._A4 * (B42 - this._B41);
  }
  vals.a12 = arcmode ? s12_a12 : sig12 /
      net.sf.geographiclib.GeoMath.degree;
  return vals;
};
