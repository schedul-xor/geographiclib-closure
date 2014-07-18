goog.provide('net.sf.geographiclib.Geodesic');

goog.require('goog.asserts');
goog.require('net.sf.geographiclib.Accuracy');
goog.require('net.sf.geographiclib.GeoMath');
goog.require('net.sf.geographiclib.GeodesicMask');



/**
 * Geodesic calculations.
 * <p>
 * The shortest path between two points on a ellipsoid at (<i>lat1</i>,
 * <i>lon1</i>) and (<i>lat2</i>, <i>lon2</i>) is called the geodesic.  Its
 * length is <i>s12</i> and the geodesic from point 1 to point 2 has azimuths
 * <i>azi1</i> and <i>azi2</i> at the two end points.  (The azimuth is the
 * heading measured clockwise from north.  <i>azi2</i> is the "forward"
 * azimuth, i.e., the heading that takes you beyond point 2 not back to point
 * 1.)
 * <p>
 * Given <i>lat1</i>, <i>lon1</i>, <i>azi1</i>, and <i>s12</i>, we can
 * determine <i>lat2</i>, <i>lon2</i>, and <i>azi2</i>.  This is the
 * <i>direct</i> geodesic problem and its solution is given by the function
 * Direct.  (If <i>s12</i> is sufficiently large that the
 * geodesic wraps more than halfway around the earth, there will be another
 * geodesic between the points with a smaller <i>s12</i>.)
 * <p>
 * Given <i>lat1</i>, <i>lon1</i>, <i>lat2</i>, and <i>lon2</i>, we can
 * determine <i>azi1</i>, <i>azi2</i>, and <i>s12</i>.  This is the
 * <i>inverse</i> geodesic problem, whose solution is given by
 * Inverse.  Usually, the solution to the inverse problem is unique.  In cases
 * where there are multiple solutions (all with the same <i>s12</i>, of
 * course), all the solutions can be easily generated once a particular
 * solution is provided.
 * <p>
 * The standard way of specifying the direct problem is the specify the
 * distance <i>s12</i> to the second point.  However it is sometimes useful
 * instead to specify the arc length <i>a12</i> (in degrees) on the auxiliary
 * sphere.  This is a mathematical construct used in solving the geodesic
 * problems.  The solution of the direct problem in this form is provided by
 * ArcDirect.  An arc length in excess of 180&deg; indicates
 * that the geodesic is not a shortest path.  In addition, the arc length
 * between an equatorial crossing and the next extremum of latitude for a
 * geodesic is 90&deg;.
 * <p>
 * This class can also calculate several other quantities related to
 * geodesics.  These are:
 * <ul>
 * <li>
 *   <i>reduced length</i>.  If we fix the first point and increase
 *   <i>azi1</i> by <i>dazi1</i> (radians), the second point is displaced
 *   <i>m12</i> <i>dazi1</i> in the direction <i>azi2</i> + 90&deg;.  The
 *   quantity <i>m12</i> is called the "reduced length" and is symmetric under
 *   interchange of the two points.  On a curved surface the reduced length
 *   obeys a symmetry relation, <i>m12</i> + <i>m21</i> = 0.  On a flat
 *   surface, we have <i>m12</i> = <i>s12</i>.  The ratio <i>s12</i>/<i>m12</i>
 *   gives the azimuthal scale for an azimuthal equidistant projection.
 * <li>
 *   <i>geodesic scale</i>.  Consider a reference geodesic and a second
 *   geodesic parallel to this one at point 1 and separated by a small distance
 *   <i>dt</i>.  The separation of the two geodesics at point 2 is <i>M12</i>
 *   <i>dt</i> where <i>M12</i> is called the "geodesic scale".  <i>M21</i> is
 *   defined similarly (with the geodesics being parallel at point 2).  On a
 *   flat surface, we have <i>M12</i> = <i>M21</i> = 1.  The quantity
 *   1/<i>M12</i> gives the scale of the Cassini-Soldner projection.
 * <li>
 *   <i>area</i>.  The area between the geodesic from point 1 to point 2 and
 *   the equation is represented by <i>S12</i>; it is the area, measured
 *   counter-clockwise, of the geodesic quadrilateral with corners
 *   (<i>lat1</i>, <i>lon1</i>), (0, <i>lon1</i>), (0, <i>lon2</i>), and
 *   (<i>lat2</i>, <i>lon2</i>).  It can be used to compute the area of any
 *   simple geodesic polygon.
 * </ul>
 * <p>
 * The quantities <i>m12</i>, <i>M12</i>, <i>M21</i> which all specify the
 * behavior of nearby geodesics obey addition rules.  If points 1, 2, and 3 all
 * lie on a single geodesic, then the following rules hold:
 * <ul>
 * <li>
 *   <i>s13</i> = <i>s12</i> + <i>s23</i>
 * <li>
 *   <i>a13</i> = <i>a12</i> + <i>a23</i>
 * <li>
 *   <i>S13</i> = <i>S12</i> + <i>S23</i>
 * <li>
 *   <i>m13</i> = <i>m12</i> <i>M23</i> + <i>m23</i> <i>M21</i>
 * <li>
 *   <i>M13</i> = <i>M12</i> <i>M23</i> &minus; (1 &minus; <i>M12</i>
 *   <i>M21</i>) <i>m23</i> / <i>m12</i>
 * <li>
 *   <i>M31</i> = <i>M32</i> <i>M21</i> &minus; (1 &minus; <i>M23</i>
 *   <i>M32</i>) <i>m12</i> / <i>m23</i>
 * </ul>
 * <p>
 * The results of the geodesic calculations are bundled up into a {@link
 * GeodesicData} object which includes the input parameters and all the
 * computed results, i.e., <i>lat1</i>, <i>lon1</i>, <i>azi1</i>, <i>lat2</i>,
 * <i>lon2</i>, <i>azi2</i>, <i>s12</i>, <i>a12</i>, <i>m12</i>, <i>M12</i>,
 * <i>M21</i>, <i>S12</i>.
 * <p>
 * The functions  Direct,
 * {@link ArcDirect}, and
 * {@link Inverse} include an
 * optional final argument <i>outmask</i> which allows you specify which
 * results should be computed and returned.  If you omit <i>outmask</i>, then
 * the "standard" geodesic results are computed (latitudes, longitudes,
 * azimuths, and distance).  <i>outmask</i> is bitor'ed combination of {@link
 * GeodesicMask} values.  For example, if you wish just to compute the distance
 * between two points you would call, e.g.,
 * <pre>
 * {@code
 *  GeodesicData g = Geodesic.WGS84.Inverse(lat1, lon1, lat2, lon2,
 *                      GeodesicMask.DISTANCE); }</pre>
 * <p>
 * Additional functionality is provided by the {@link GeodesicLine} class,
 * which allows a sequence of points along a geodesic to be computed.
 * <p>
 * The shortest distance returned by the solution of the inverse problem is
 * (obviously) uniquely defined.  However, in a few special cases there are
 * multiple azimuths which yield the same shortest distance.  Here is a
 * catalog of those cases:
 * <ul>
 * <li>
 *   <i>lat1</i> = &minus;<i>lat2</i> (with neither point at a pole).  If
 *   <i>azi1</i> = <i>azi2</i>, the geodesic is unique.  Otherwise there are
 *   two geodesics and the second one is obtained by setting [<i>azi1</i>,
 *   <i>azi2</i>] = [<i>azi2</i>, <i>azi1</i>], [<i>M12</i>, <i>M21</i>] =
 *   [<i>M21</i>, <i>M12</i>], <i>S12</i> = &minus;<i>S12</i>.  (This occurs
 *   when the longitude difference is near &plusmn;180&deg; for oblate
 *   ellipsoids.)
 * <li>
 *   <i>lon2</i> = <i>lon1</i> &plusmn; 180&deg; (with neither point at a
 *   pole).  If <i>azi1</i> = 0&deg; or &plusmn;180&deg;, the geodesic is
 *   unique.  Otherwise there are two geodesics and the second one is obtained
 *   by setting [ <i>azi1</i>, <i>azi2</i>] = [&minus;<i>azi1</i>,
 *   &minus;<i>azi2</i>], <i>S12</i> = &minus; <i>S12</i>.  (This occurs when
 *   <i>lat2</i> is near &minus;<i>lat1</i> for prolate ellipsoids.)
 * <li>
 *   Points 1 and 2 at opposite poles.  There are infinitely many geodesics
 *   which can be generated by setting [<i>azi1</i>, <i>azi2</i>] =
 *   [<i>azi1</i>, <i>azi2</i>] + [<i>d</i>, &minus;<i>d</i>], for arbitrary
 *   <i>d</i>.  (For spheres, this prescription applies when points 1 and 2 are
 *   antipodal.)
 * <li>
 *   s12 = 0 (coincident points).  There are infinitely many geodesics which
 *   can be generated by setting [<i>azi1</i>, <i>azi2</i>] = [<i>azi1</i>,
 *   <i>azi2</i>] + [<i>d</i>, <i>d</i>], for arbitrary <i>d</i>.
 * </ul>
 * <p>
 * The calculations are accurate to better than 15 nm (15 nanometers) for the
 * WGS84 ellipsoid.  See Sec. 9 of
 * <a href="http://arxiv.org/abs/1102.1215v1">arXiv:1102.1215v1</a> for
 * details.  The algorithms used by this class are based on series expansions
 * using the flattening <i>f</i> as a small parameter.  These are only accurate
 * for |<i>f</i>| &lt; 0.02; however reasonably accurate results will be
 * obtained for |<i>f</i>| &lt; 0.2.  Here is a table of the approximate
 * maximum error (expressed as a distance) for an ellipsoid with the same
 * major radius as the WGS84 ellipsoid and different values of the
 * flattening.<pre>
 *     |f|      error
 *     0.01     25 nm
 *     0.02     30 nm
 *     0.05     10 um
 *     0.1     1.5 mm
 *     0.2     300 mm </pre>
 * <p>
 * The algorithms are described in
 * <ul>
 * <li>C. F. F. Karney,
 *   <a href="http://dx.doi.org/10.1007/s00190-012-0578-z">
 *   Algorithms for geodesics</a>,
 *   J. Geodesy <b>87</b>, 43&ndash;55 (2013);
 *   DOI: <a href="http://dx.doi.org/10.1007/s00190-012-0578-z">
 *   10.1007/s00190-012-0578-z</a>;
 *   addenda: <a href="http://geographiclib.sf.net/geod-addenda.html">
 *   geod-addenda.html</a>.
 * </ul>
 * @constructor
 * @param {!number} a
 * @param {!number} f
 */
net.sf.geographiclib.Geodesic = function(a, f) {
  this._a = a;
  this._f = f <= 1 ? f : 1 / f;
  this._f1 = 1 - this._f;
  this._e2 = this._f * (2 - this._f);
  this._ep2 = this._e2 / net.sf.geographiclib.GeoMath.sq(this._f1);
  this._n = this._f / (2 - this._f);
  this._b = this._a * this._f1;
  this._c2 = (net.sf.geographiclib.GeoMath.sq(this._a) +
              net.sf.geographiclib.GeoMath.sq(this._b) *
              (this._e2 == 0 ? 1 :
               (this._e2 > 0 ?
                net.sf.geographiclib.GeoMath.atanh(Math.sqrt(this._e2)) :
                Math.atan(Math.sqrt(-this._e2))) /
               Math.sqrt(Math.abs(this._e2)))) / 2;
  // authalic radius squared
  // The sig12 threshold for "really short".  Using the auxiliary sphere
  // solution with dnm computed at (bet1 + bet2) / 2, the relative error in
  // the azimuth consistency check is sig12^2 * abs(f) * min(1, 1-f/2) / 2.
  // (Error measured for 1/100 < b/a < 100 and abs(f) >= 1/1000.  For a
  // given f and sig12, the max error occurs for lines near the pole.  If
  // the old rule for computing dnm = (dn1 + dn2)/2 is used, then the error
  // increases by a factor of 2.)  Setting this equal to epsilon gives
  // sig12 = etol2.  Here 0.1 is a safety factor (error decreased by 100)
  // and max(0.001, abs(f)) stops etol2 getting too large in the nearly
  // spherical case.
  this._etol2 = 0.1 * net.sf.geographiclib.Accuracy.getInstance().tol2() /
      Math.sqrt(Math.max(0.001, Math.abs(this._f)) *
                  Math.min(1.0, 1 - this._f / 2) / 2);
  goog.asserts.assert(isFinite(this._a) && this._a > 0,
                      'Major radius is not positive');
  goog.asserts.assert(isFinite(this._b) && this._b > 0,
                      'Minor radius is not positive');
  this._A3x = new Array(net.sf.geographiclib.Accuracy.getInstance().na3x());
  this._C3x = new Array(net.sf.geographiclib.Accuracy.getInstance().nc3x());
  this._C4x = new Array(net.sf.geographiclib.Accuracy.getInstance().nc4x());
  this.A3coeff();
  this.C3coeff();
  this.C4coeff();
};


/**
 * @param {!boolean} sinp
 * @param {!number} sinx
 * @param {!number} cosx
 * @param {!Array.<!number>} c
 * @param {!number} n
 * @return {!number}
 */
net.sf.geographiclib.Geodesic.SinCosSeries = function(sinp, sinx, cosx, c, n) {
  var k = n + (sinp ? 1 : 0);
  var
      ar = 2 * (cosx - sinx) * (cosx + sinx),
      y0 = n & 1 ? c[--k] : 0,
      y1 = 0;
  n = Math.floor(n / 2);
  while (n--) {
    y1 = ar * y0 - y1 + c[--k];
    y0 = ar * y1 - y0 + c[--k];
  }
  return (sinp ? 2 * sinx * cosx * y0 : cosx * (y0 - y1));
};


/**
 * @param {!number} x
 * @return {!number}
 */
net.sf.geographiclib.Geodesic.AngRound = function(x) {
  var z = 1 / 16;
  var y = Math.abs(x);
  y = y < z ? z - (z - y) : y;
  return x < 0 ? -y : y;
};


/**
 * @param {!number} x
 * @param {!number} y
 * @return {!number}
 */
net.sf.geographiclib.Geodesic.Astroid = function(x, y) {
  var k;
  var
      p = net.sf.geographiclib.GeoMath.sq(x),
      q = net.sf.geographiclib.GeoMath.sq(y),
      r = (p + q - 1) / 6;
  if (!(q == 0 && r <= 0)) {
    var
        S = p * q / 4,
        r2 = net.sf.geographiclib.GeoMath.sq(r),
        r3 = r * r2,
        disc = S * (S + 2 * r3);
    var u = r;
    if (disc >= 0) {
      var T3 = S + r3;
      T3 += T3 < 0 ? -Math.sqrt(disc) : Math.sqrt(disc);
      var T = net.sf.geographiclib.GeoMath.cbrt(T3);
      u += T + (T != 0 ? r2 / T : 0);
    } else {
      var ang = Math.atan2(Math.sqrt(-disc), -(S + r3));
      u += 2 * r * Math.cos(ang / 3);
    }
    var
        v = Math.sqrt(net.sf.geographiclib.GeoMath.sq(u) + q),
        uv = u < 0 ? q / (v - u) : u + v,
        w = (uv - q) / (2 * v);
    k = uv / (Math.sqrt(uv + net.sf.geographiclib.GeoMath.sq(w)) + w);
  } else {
    k = 0;
  }
  return k;
};


/**
 * @param {!number} eps
 * @return {!number}
 */
net.sf.geographiclib.Geodesic.A1m1f = function(eps) {
  var
      eps2 = net.sf.geographiclib.GeoMath.sq(eps),
      t = eps2 * (eps2 * (eps2 + 4) + 64) / 256;
  return (t + eps) / (1 - eps);
};


/**
 * @param {!number} eps
 * @param {!Array.<!number>} c
 */
net.sf.geographiclib.Geodesic.C1f = function(eps, c) {
  var
      eps2 = net.sf.geographiclib.GeoMath.sq(eps),
      d = eps;
  c[1] = d * ((6 - eps2) * eps2 - 16) / 32;
  d *= eps;
  c[2] = d * ((64 - 9 * eps2) * eps2 - 128) / 2048;
  d *= eps;
  c[3] = d * (9 * eps2 - 16) / 768;
  d *= eps;
  c[4] = d * (3 * eps2 - 5) / 512;
  d *= eps;
  c[5] = -7 * d / 1280;
  d *= eps;
  c[6] = -7 * d / 2048;
};


/**
 * @param {!number} eps
 * @param {!Array.<!number>} c
 */
net.sf.geographiclib.Geodesic.C1pf = function(eps, c) {
  var
      eps2 = net.sf.geographiclib.GeoMath.sq(eps),
      d = eps;
  c[1] = d * (eps2 * (205 * eps2 - 432) + 768) / 1536;
  d *= eps;
  c[2] = d * (eps2 * (4005 * eps2 - 4736) + 3840) / 12288;
  d *= eps;
  c[3] = d * (116 - 225 * eps2) / 384;
  d *= eps;
  c[4] = d * (2695 - 7173 * eps2) / 7680;
  d *= eps;
  c[5] = 3467 * d / 7680;
  d *= eps;
  c[6] = 38081 * d / 61440;
};


/**
 * @param {!number} eps
 * @return {!number}
 */
net.sf.geographiclib.Geodesic.A2m1f = function(eps) {
  var
      eps2 = net.sf.geographiclib.GeoMath.sq(eps),
      t = eps2 * (eps2 * (25 * eps2 + 36) + 64) / 256;
  return t * (1 - eps) - eps;
};


/**
 * @param {!number} eps
 * @param {!Array.<!number>} c
 */
net.sf.geographiclib.Geodesic.C2f = function(eps, c) {
  var
      eps2 = net.sf.geographiclib.GeoMath.sq(eps),
      d = eps;
  c[1] = d * (eps2 * (eps2 + 2) + 16) / 32;
  d *= eps;
  c[2] = d * (eps2 * (35 * eps2 + 64) + 384) / 2048;
  d *= eps;
  c[3] = d * (15 * eps2 + 80) / 768;
  d *= eps;
  c[4] = d * (7 * eps2 + 35) / 512;
  d *= eps;
  c[5] = 63 * d / 1280;
  d *= eps;
  c[6] = 77 * d / 2048;
};


/**
 * Fill A3 coefficients
 */
net.sf.geographiclib.Geodesic.prototype.A3coeff = function() {
  var _n = this._n;
  this._A3x[0] = 1;
  this._A3x[1] = (_n - 1) / 2;
  this._A3x[2] = (_n * (3 * _n - 1) - 2) / 8;
  this._A3x[3] = ((-_n - 3) * _n - 1) / 16;
  this._A3x[4] = (-2 * _n - 3) / 64;
  this._A3x[5] = -3 / 128;
};


/**
 * Fill C3 coefficients
 */
net.sf.geographiclib.Geodesic.prototype.C3coeff = function() {
  var _n = this._n;
  this._C3x[0] = (1 - _n) / 4;
  this._C3x[1] = (1 - _n * _n) / 8;
  this._C3x[2] = ((3 - _n) * _n + 3) / 64;
  this._C3x[3] = (2 * _n + 5) / 128;
  this._C3x[4] = 3 / 128;
  this._C3x[5] = ((_n - 3) * _n + 2) / 32;
  this._C3x[6] = ((-3 * _n - 2) * _n + 3) / 64;
  this._C3x[7] = (_n + 3) / 128;
  this._C3x[8] = 5 / 256;
  this._C3x[9] = (_n * (5 * _n - 9) + 5) / 192;
  this._C3x[10] = (9 - 10 * _n) / 384;
  this._C3x[11] = 7 / 512;
  this._C3x[12] = (7 - 14 * _n) / 512;
  this._C3x[13] = 7 / 512;
  this._C3x[14] = 21 / 2560;
};


/**
 * Fill C4 coefficients
 */
net.sf.geographiclib.Geodesic.prototype.C4coeff = function() {
  var _n = this._n;
  this._C4x[0] = (_n * (_n * (_n * (_n * (100 * _n + 208) + 572) +
                              3432) - 12012) + 30030) / 45045;
  this._C4x[1] = (_n * (_n * (_n * (64 * _n + 624) - 4576) + 6864) -
                  3003) / 15015;
  this._C4x[2] = (_n * ((14144 - 10656 * _n) * _n - 4576) - 858) / 45045;
  this._C4x[3] = ((-224 * _n - 4784) * _n + 1573) / 45045;
  this._C4x[4] = (1088 * _n + 156) / 45045;
  this._C4x[5] = 97 / 15015.0;
  this._C4x[6] = (_n * (_n * ((-64 * _n - 624) * _n + 4576) - 6864) +
      3003) / 135135;
  this._C4x[7] = (_n * (_n * (5952 * _n - 11648) + 9152) - 2574) / 135135;
  this._C4x[8] = (_n * (5792 * _n + 1040) - 1287) / 135135;
  this._C4x[9] = (468 - 2944 * _n) / 135135;
  this._C4x[10] = 1 / 9009.0;
  this._C4x[11] = (_n * ((4160 - 1440 * _n) * _n - 4576) + 1716) / 225225;
  this._C4x[12] = ((4992 - 8448 * _n) * _n - 1144) / 225225;
  this._C4x[13] = (1856 * _n - 936) / 225225;
  this._C4x[14] = 8 / 10725.0;
  this._C4x[15] = (_n * (3584 * _n - 3328) + 1144) / 315315;
  this._C4x[16] = (1024 * _n - 208) / 105105;
  this._C4x[17] = -136 / 63063.0;
  this._C4x[18] = (832 - 2560 * _n) / 405405;
  this._C4x[19] = -128 / 135135.0;
  this._C4x[20] = 128 / 99099.0;
};


/**
 * @param {!number} eps
 * @return {!number}
 */
net.sf.geographiclib.Geodesic.prototype.A3f = function(eps) {
  var v = 0;
  for (var i = net.sf.geographiclib.Accuracy.getInstance().na3x(); i;)
    v = eps * v + this._A3x[--i];
  return v;
};


/**
 * @param {!number} eps
 * @param {!Array.<!number>} c
 */
net.sf.geographiclib.Geodesic.prototype.C3f = function(eps, c) {
  for (var j = net.sf.geographiclib.Accuracy.getInstance().nc3x(),
       k = net.sf.geographiclib.Accuracy.getInstance().nc3() - 1; k;) {
    var t = 0;
    for (var i = net.sf.geographiclib.Accuracy.getInstance().nc3() - k; i; --i)
      t = eps * t + this._C3x[--j];
    c[k--] = t;
  }
  var mult = 1;
  for (k = 1; k < net.sf.geographiclib.Accuracy.getInstance().nc3();) {
    mult *= eps;
    c[k++] *= mult;
  }
};


/**
 * @param {!number} eps
 * @param {!Array.<!number>} c
 */
net.sf.geographiclib.Geodesic.prototype.C4f = function(eps, c) {
  for (var j = net.sf.geographiclib.Accuracy.getInstance().nc4x(),
       k = net.sf.geographiclib.Accuracy.getInstance().nc4(); k;) {
    var t = 0;
    for (var i = net.sf.geographiclib.Accuracy.getInstance().
         nc4() - k + 1; i; --i)
      t = eps * t + this._C4x[--j];
    c[--k] = t;
  }
  var mult = 1;
  for (k = 1; k < net.sf.geographiclib.Accuracy.getInstance().nc4();) {
    mult *= eps;
    c[k++] *= mult;
  }
};


/**
 * @param {!number} eps
 * @param {!number} sig12
 * @param {!number} ssig1
 * @param {!number} csig1
 * @param {!number} dn1
 * @param {!number} ssig2
 * @param {!number} csig2
 * @param {!number} dn2
 * @param {!number} cbet1
 * @param {!number} cbet2
 * @param {!boolean} scalep
 * @param {!Array.<!number>} C1a
 * @param {!Array.<!number>} C2a
 * @return {!{
 * m0:!number,
 * m12b:!number,
 * s12b:!number,
 * M12:!number,
 * M21:!number}}
 */
net.sf.geographiclib.Geodesic.prototype.Lengths = function(eps, sig12,
    ssig1, csig1, dn1, ssig2, csig2, dn2,
    cbet1, cbet2, scalep,
    C1a, C2a) {
  var vals = {
    m0: 0,
    m12b: 0,
    s12b: 0,
    M12: 0,
    M21: 0
  };
  net.sf.geographiclib.Geodesic.C1f(eps, C1a);
  net.sf.geographiclib.Geodesic.C2f(eps, C2a);
  var
      A1m1 = net.sf.geographiclib.Geodesic.A1m1f(eps),
      AB1 = (1 + A1m1) * (net.sf.geographiclib.Geodesic.SinCosSeries(
      true, ssig2, csig2, C1a,
      net.sf.geographiclib.Accuracy.getInstance().nc1()) -
                      net.sf.geographiclib.Geodesic.SinCosSeries(
                        true, ssig1, csig1, C1a,
                        net.sf.geographiclib.Accuracy.getInstance().nc1())),
      A2m1 = net.sf.geographiclib.Geodesic.A2m1f(eps),
      AB2 = (1 + A2m1) * (net.sf.geographiclib.Geodesic.SinCosSeries(
                        true, ssig2, csig2, C2a,
                        net.sf.geographiclib.Accuracy.getInstance().nc2()) -
                      net.sf.geographiclib.Geodesic.SinCosSeries(
                        true, ssig1, csig1, C2a,
                        net.sf.geographiclib.Accuracy.getInstance().nc2()));
  vals.m0 = A1m1 - A2m1;
  var J12 = vals.m0 * sig12 + (AB1 - AB2);
  vals.m12b = dn2 * (csig1 * ssig2) - dn1 * (ssig1 * csig2) -
      csig1 * csig2 * J12;
  vals.s12b = (1 + A1m1) * sig12 + AB1;
  if (scalep) {
    var csig12 = csig1 * csig2 + ssig1 * ssig2;
    var t = this._ep2 * (cbet1 - cbet2) * (cbet1 + cbet2) / (dn1 + dn2);
    vals.M12 = csig12 + (t * ssig2 - csig2 * J12) * ssig1 / dn1;
    vals.M21 = csig12 - (t * ssig1 - csig1 * J12) * ssig2 / dn2;
  }
  return vals;
};


/**
 * @param {!number} sbet1
 * @param {!number} cbet1
 * @param {!number} dn1
 * @param {!number} sbet2
 * @param {!number} cbet2
 * @param {!number} dn2
 * @param {!number} lam12
 * @param {!Array.<!number>} C1a
 * @param {!Array.<!number>} C2a
 * @return {!{
 * dnm:!number,
 * salp1:!number,
 * calp1:!number,
 * salp2:!number,
 * calp2:!number,
 * sig12:!number
 * }}
 */
net.sf.geographiclib.Geodesic.prototype.InverseStart =
    function(sbet1, cbet1, dn1,
    sbet2, cbet2, dn2, lam12,
    C1a, C2a) {
  var
      vals = {
        dnm: 0,
        salp1: 0,
        calp1: 0,
        salp2: 0,
        calp2: 0,
        sig12: 0
      },
      sbet12 = sbet2 * cbet1 - cbet2 * sbet1,
      cbet12 = cbet2 * cbet1 + sbet2 * sbet1;
  vals.sig12 = -1;
  var sbet12a = sbet2 * cbet1;
  sbet12a += cbet2 * sbet1;
  var shortline = cbet12 >= 0 && sbet12 < 0.5 && cbet2 * lam12 < 0.5;
  var omg12 = lam12;
  if (shortline) {
    var sbetm2 = net.sf.geographiclib.GeoMath.sq(sbet1 + sbet2);
    sbetm2 /= sbetm2 + net.sf.geographiclib.GeoMath.sq(cbet1 + cbet2);
    vals.dnm = Math.sqrt(1 + this._ep2 * sbetm2);
    omg12 /= this._f1 * vals.dnm;
  }
  var somg12 = Math.sin(omg12),
      comg12 = Math.cos(omg12);
  vals.salp1 = cbet2 * somg12;
  vals.calp1 = comg12 >= 0 ?
      sbet12 + cbet2 * sbet1 *
      net.sf.geographiclib.GeoMath.sq(somg12) / (1 + comg12) :
      sbet12a - cbet2 * sbet1 *
      net.sf.geographiclib.GeoMath.sq(somg12) / (1 - comg12);
  var
      ssig12 = net.sf.geographiclib.GeoMath.hypot(vals.salp1, vals.calp1),
      csig12 = sbet1 * sbet2 + cbet1 * cbet2 * comg12;
  if (shortline && ssig12 < this._etol2) {
    vals.salp2 = cbet1 * somg12;
    vals.calp2 = sbet12 - cbet1 * sbet2 *
        (comg12 >= 0 ? net.sf.geographiclib.GeoMath.sq(somg12) /
        (1 + comg12) : 1 - comg12);
    var t = net.sf.geographiclib.GeoMath.hypot(vals.salp2, vals.calp2);
    vals.salp2 /= t;
    vals.calp2 /= t;
    vals.sig12 = Math.atan2(ssig12, csig12);
  } else if (Math.abs(this._n) > 0.1 ||
             csig12 >= 0 ||
             ssig12 >= 6 * Math.abs(this._n) * Math.PI *
             net.sf.geographiclib.GeoMath.sq(cbet1)) {
  } else {
    var y = 0, lamscale = 0, betscale = 0;
    var x = 0;
    if (this._f >= 0) {
      var
          k2 = net.sf.geographiclib.GeoMath.sq(sbet1) * this._ep2,
          eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
      lamscale = this._f * cbet1 * this.A3f(eps) * Math.PI;
      betscale = lamscale * cbet1;
      x = (lam12 - Math.PI) / lamscale;
      y = sbet12a / betscale;
    } else {
      var
          cbet12a = cbet2 * cbet1 - sbet2 * sbet1,
          bet12a = Math.atan2(sbet12a, cbet12a);
      var m12b = 0, m0 = 0;
      var nvals = this.Lengths(this._n, Math.PI + bet12a,
          sbet1, -cbet1, dn1, sbet2, cbet2, dn2,
          cbet1, cbet2, false, C1a, C2a);
      m12b = nvals.m12b;
      m0 = nvals.m0;
      x = -1 + m12b / (cbet1 * cbet2 * m0 * Math.PI);
      betscale = x < -0.01 ? sbet12a / x : -this._f *
          net.sf.geographiclib.GeoMath.sq(cbet1) * Math.PI;
      lamscale = betscale / cbet1;
      y = (lam12 - Math.PI) / lamscale;
    }
    if (y > -net.sf.geographiclib.Accuracy.getInstance().tol1() &&
        x > -1 - net.sf.geographiclib.Accuracy.getInstance().xthresh()) {
      if (this._f >= 0) {
        vals.salp1 = Math.min(1, -x);
        vals.calp1 = -Math.sqrt(1 -
                                net.sf.geographiclib.GeoMath.sq(vals.salp1));
      } else {
        vals.calp1 = Math.max(x >
                              -net.sf.geographiclib.Accuracy.getInstance().
                              tol1() ? 0 : -1, x);
        vals.salp1 = Math.sqrt(1 -
                               net.sf.geographiclib.GeoMath.sq(vals.calp1));
      }
    } else {
      var k = net.sf.geographiclib.Geodesic.Astroid(x, y);
      var omg12a = lamscale *
          (this._f >= 0 ? -x * k / (1 + k) : -y * (1 + k) / k);
      somg12 = Math.sin(omg12a);
      comg12 = -Math.cos(omg12a);
      vals.salp1 = cbet2 * somg12;
      vals.calp1 = sbet12a - cbet2 * sbet1 *
          net.sf.geographiclib.GeoMath.sq(somg12) / (1 - comg12);
    }
  }
  if (vals.salp1 > 0) {
    var t = net.sf.geographiclib.GeoMath.hypot(vals.salp1, vals.calp1);
    vals.salp1 /= t;
    vals.calp1 /= t;
  } else {
    vals.salp1 = 1;
    vals.calp1 = 0;
  }
  return vals;
};


/**
 * @param {!number} sbet1
 * @param {!number} cbet1
 * @param {!number} dn1
 * @param {!number} sbet2
 * @param {!number} cbet2
 * @param {!number} dn2
 * @param {!number} salp1
 * @param {!number} calp1
 * @param {!boolean} diffp
 * @param {!Array.<!number>} C1a
 * @param {!Array.<!number>} C2a
 * @param {!Array.<!number>} C3a
 * @return {!{
 * ssig1:!number,
 * csig1:!number,
 * salp2:!number,
 * calp2:!number,
 * ssig2:!number,
 * csig2:!number,
 * sig12:!number,
 * eps:!number,
 * domg12:!number,
 * lam12:!number,
 * dlam12:!number
 * }}
 */
net.sf.geographiclib.Geodesic.prototype.Lambda12 =
    function(sbet1, cbet1, dn1, sbet2, cbet2, dn2,
    salp1, calp1, diffp,
    C1a, C2a, C3a) {
  var vals = {
    ssig1: 0,
    csig1: 0,
    salp2: 0,
    calp2: 0,
    ssig2: 0,
    csig2: 0,
    sig12: 0,
    eps: 0,
    domg12: 0,
    lam12: 0,
    dlam12: 0
  };
  if (sbet1 == 0 && calp1 == 0)
    calp1 = -net.sf.geographiclib.Accuracy.getInstance().tiny();
  var
      salp0 = salp1 * cbet1,
      calp0 = net.sf.geographiclib.GeoMath.hypot(calp1, salp1 * sbet1);
  var somg1 = 0, comg1 = 0, somg2 = 0, comg2 = 0, omg12 = 0;
  vals.ssig1 = sbet1;
  somg1 = salp0 * sbet1;
  vals.csig1 = comg1 = calp1 * cbet1;
  var t = net.sf.geographiclib.GeoMath.hypot(vals.ssig1, vals.csig1);
  vals.ssig1 /= t;
  vals.csig1 /= t;
  vals.salp2 = cbet2 != cbet1 ? salp0 / cbet2 : salp1;
  vals.calp2 = cbet2 != cbet1 || Math.abs(sbet2) != -sbet1 ?
      Math.sqrt(net.sf.geographiclib.GeoMath.sq(
      calp1 * cbet1) + (cbet1 < -sbet1 ?
      (cbet2 - cbet1) * (cbet1 + cbet2) :
      (sbet1 - sbet2) * (sbet1 + sbet2))) / cbet2 : Math.abs(calp1);
  vals.ssig2 = sbet2;
  somg2 = salp0 * sbet2;
  vals.csig2 = comg2 = vals.calp2 * cbet2;
  t = net.sf.geographiclib.GeoMath.hypot(vals.ssig2, vals.csig2);
  vals.ssig2 /= t;
  vals.csig2 /= t;
  vals.sig12 = Math.atan2(Math.max(vals.csig1 * vals.ssig2 -
                                   vals.ssig1 * vals.csig2, 0),
                          vals.csig1 * vals.csig2 + vals.ssig1 * vals.ssig2);
  omg12 = Math.atan2(Math.max(
      comg1 * somg2 - somg1 * comg2, 0),
      comg1 * comg2 + somg1 * somg2);
  var B312, h0 = 0;
  var k2 = net.sf.geographiclib.GeoMath.sq(calp0) * this._ep2;
  vals.eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
  this.C3f(vals.eps, C3a);
  B312 = (net.sf.geographiclib.Geodesic.SinCosSeries(
      true, vals.ssig2, vals.csig2, C3a,
      net.sf.geographiclib.Accuracy.getInstance().nc3() - 1) -
      net.sf.geographiclib.Geodesic.SinCosSeries(
              true, vals.ssig1, vals.csig1, C3a,
              net.sf.geographiclib.Accuracy.getInstance().nc3() - 1));
  h0 = -this._f * this.A3f(vals.eps);
  vals.domg12 = salp0 * h0 * (vals.sig12 + B312);
  vals.lam12 = omg12 + vals.domg12;
  if (diffp) {
    if (vals.calp2 == 0)
      vals.dlam12 = -2 * this._f1 * dn1 / sbet1;
    else {
      var nvals = this.Lengths(vals.eps, vals.sig12,
                               vals.ssig1, vals.csig1, dn1,
                               vals.ssig2, vals.csig2, dn2,
                               cbet1, cbet2, false, C1a, C2a);
      vals.dlam12 = nvals.m12b;
      vals.dlam12 *= this._f1 / (vals.calp2 * cbet2);
    }
  }
  return vals;
};


/**
 * @param {!number} lat1
 * @param {!number} lon1
 * @param {!number} lat2
 * @param {!number} lon2
 * @param {!number} outmask
 * @return {!{
 * M12:!number,
 * M21:!number,
 * a12:!number,
 * s12:!number,
 * m12:!number,
 * S12:!number,
 * azi1:!number,
 * azi2:!number
 * }}
 */
net.sf.geographiclib.Geodesic.prototype.GenInverse =
    function(lat1, lon1, lat2, lon2, outmask) {
  var vals = {
    M12: 0,
    M21: 0,
    a12: 0,
    s12: 0,
    m12: 0,
    S12: 0,
    azi1: 0,
    azi2: 0
  };
  outmask &= net.sf.geographiclib.GeodesicMask.getInstance().OUT_ALL;
  var lon12 = net.sf.geographiclib.GeoMath.angDiff(
      net.sf.geographiclib.GeoMath.angNormalize(lon1),
      net.sf.geographiclib.GeoMath.angNormalize(lon2));
  lon12 = net.sf.geographiclib.Geodesic.AngRound(lon12);
  var lonsign = lon12 >= 0 ? 1 : -1;
  lon12 *= lonsign;
  lat1 = net.sf.geographiclib.Geodesic.AngRound(lat1);
  lat2 = net.sf.geographiclib.Geodesic.AngRound(lat2);
  var swapp = Math.abs(lat1) >= Math.abs(lat2) ? 1 : -1;
  if (swapp < 0) {
    lonsign *= -1;
    var t = lat1;
    lat1 = lat2;
    lat2 = t;
  }
  var latsign = lat1 < 0 ? 1 : -1;
  lat1 *= latsign;
  lat2 *= latsign;
  var phi = 0, sbet1 = 0, cbet1 = 0, sbet2 = 0, cbet2 = 0, s12x = 0, m12x = 0;
  phi = lat1 * net.sf.geographiclib.GeoMath.degree;
  sbet1 = this._f1 * Math.sin(phi);
  cbet1 = lat1 == -90 ?
          net.sf.geographiclib.Accuracy.getInstance().tiny() : Math.cos(phi);
  var t = net.sf.geographiclib.GeoMath.hypot(sbet1, cbet1);
  sbet1 /= t;
  cbet1 /= t;
  phi = lat2 * net.sf.geographiclib.GeoMath.degree;
  sbet2 = this._f1 * Math.sin(phi);
  cbet2 = Math.abs(lat2) == 90 ?
          net.sf.geographiclib.Accuracy.getInstance().tiny() : Math.cos(phi);
  t = net.sf.geographiclib.GeoMath.hypot(sbet2, cbet2);
  sbet2 /= t;
  cbet2 /= t;
  if (cbet1 < -sbet1) {
    if (cbet2 == cbet1)
      sbet2 = sbet2 < 0 ? sbet1 : -sbet1;
  } else {
    if (Math.abs(sbet2) == -sbet1)
      cbet2 = cbet1;
  }
  var
      dn1 = Math.sqrt(1 + this._ep2 * net.sf.geographiclib.GeoMath.sq(sbet1)),
      dn2 = Math.sqrt(1 + this._ep2 * net.sf.geographiclib.GeoMath.sq(sbet2));
  var
      lam12 = lon12 * net.sf.geographiclib.GeoMath.degree,
      slam12 = lon12 == 180 ? 0 : Math.sin(lam12),
      clam12 = Math.cos(lam12);
  var sig12 = 0, calp1 = 0, salp1 = 0, calp2 = 0, salp2 = 0;
  var
      C1a = new Array(net.sf.geographiclib.Accuracy.getInstance().nc1() + 1),
      C2a = new Array(net.sf.geographiclib.Accuracy.getInstance().nc2() + 1),
      C3a = new Array(net.sf.geographiclib.Accuracy.getInstance().nc3());
  var meridian = lat1 == -90 || slam12 == 0;
  if (meridian) {
    calp1 = clam12;
    salp1 = slam12;
    calp2 = 1;
    salp2 = 0;
    var
        ssig1 = sbet1,
        csig1 = calp1 * cbet1,
        ssig2 = sbet2,
        csig2 = calp2 * cbet2;
    sig12 = Math.atan2(Math.max(csig1 * ssig2 - ssig1 * csig2, 0),
                       csig1 * csig2 + ssig1 * ssig2);
    var nvalsx = this.Lengths(this._n, sig12,
                              ssig1, csig1, dn1, ssig2, csig2, dn2,
                              cbet1, cbet2,
                              (outmask & net.sf.geographiclib.GeodesicMask.
                               getInstance().GEODESICSCALE) != 0,
                              C1a, C2a);
    s12x = nvalsx.s12b;
    m12x = nvalsx.m12b;
    if ((outmask & net.sf.geographiclib.GeodesicMask.
         getInstance().GEODESICSCALE) != 0) {
      vals.M12 = nvalsx.M12;
      vals.M21 = nvalsx.M21;
    }
    if (sig12 < 1 || m12x >= 0) {
      m12x *= this._b;
      s12x *= this._b;
      vals.a12 = sig12 / net.sf.geographiclib.GeoMath.degree;
    } else
      meridian = false;
  }
  var omg12 = 0;
  if (!meridian &&
      sbet1 == 0 &&
      (this._f <= 0 || lam12 <= Math.PI - this._f * Math.PI)) {
    calp1 = calp2 = 0;
    salp1 = salp2 = 1;
    s12x = this._a * lam12;
    sig12 = omg12 = lam12 / this._f1;
    m12x = this._b * Math.sin(sig12);
    if (outmask & net.sf.geographiclib.GeodesicMask.
        getInstance().GEODESICSCALE)
      vals.M12 = vals.M21 = Math.cos(sig12);
    vals.a12 = lon12 / this._f1;
  } else if (!meridian) {
    var nvals = this.InverseStart(sbet1, cbet1, dn1, sbet2, cbet2, dn2, lam12,
                                  C1a, C2a);
    sig12 = nvals.sig12;
    salp1 = nvals.salp1;
    calp1 = nvals.calp1;
    if (sig12 >= 0) {
      salp2 = nvals.salp2;
      calp2 = nvals.calp2;
      var dnm = nvals.dnm;
      s12x = sig12 * this._b * dnm;
      m12x = net.sf.geographiclib.GeoMath.sq(dnm) *
          this._b * Math.sin(sig12 / dnm);
      if (outmask & net.sf.geographiclib.GeodesicMask.
          getInstance().GEODESICSCALE)
        vals.M12 = vals.M21 = Math.cos(sig12 / dnm);
      vals.a12 = sig12 / net.sf.geographiclib.GeoMath.degree;
      omg12 = lam12 / (this._f1 * dnm);
    } else {
      var ssig1 = 0, csig1 = 0, ssig2 = 0, csig2 = 0, eps = 0;
      var numit = 0;
      var salp1a = net.sf.geographiclib.Accuracy.getInstance().tiny(),
          calp1a = 1,
          salp1b = net.sf.geographiclib.Accuracy.getInstance().tiny(),
          calp1b = -1;
      for (var tripn = false, tripb = false;
           numit < net.sf.geographiclib.Accuracy.getInstance().maxit2();
           ++numit) {
        var dv;
        nvals = this.Lambda12(sbet1, cbet1, dn1, sbet2, cbet2, dn2,
                              salp1, calp1, numit <
                              net.sf.geographiclib.Accuracy.
                              getInstance().maxit1(),
                              C1a, C2a, C3a);
        var v = nvals.lam12 - lam12;
        salp2 = nvals.salp2;
        calp2 = nvals.calp2;
        sig12 = nvals.sig12;
        ssig1 = nvals.ssig1;
        csig1 = nvals.csig1;
        ssig2 = nvals.ssig2;
        csig2 = nvals.csig2;
        eps = nvals.eps;
        omg12 = nvals.domg12;
        dv = nvals.dlam12;
        if (tripb || !(Math.abs(v) >= (tripn ? 8 : 2) *
                       net.sf.geographiclib.Accuracy.getInstance().tol0()))
          break;
        if (v > 0 && (numit <
                      net.sf.geographiclib.Accuracy.getInstance().maxit1() ||
                      calp1 / salp1 > calp1b / salp1b)) {
          salp1b = salp1;
          calp1b = calp1;
        } else if (v < 0 && (numit <
            net.sf.geographiclib.Accuracy.getInstance().maxit1() ||
                    calp1 / salp1 < calp1a / salp1a)) {
          salp1a = salp1;
          calp1a = calp1;
        }
        if (numit <
            net.sf.geographiclib.Accuracy.getInstance().maxit1() &&
            dv > 0) {
          var
              dalp1 = -v / dv;
          var
              sdalp1 = Math.sin(dalp1),
              cdalp1 = Math.cos(dalp1),
              nsalp1 = salp1 * cdalp1 + calp1 * sdalp1;
          if (nsalp1 > 0 && Math.abs(dalp1) < Math.PI) {
            calp1 = calp1 * cdalp1 - salp1 * sdalp1;
            salp1 = Math.max(0, nsalp1);
            t = net.sf.geographiclib.GeoMath.hypot(salp1, calp1);
            salp1 /= t;
            calp1 /= t;
            tripn = Math.abs(v) <= 16 *
                net.sf.geographiclib.Accuracy.getInstance().tol0();
            continue;
          }
        }
        salp1 = (salp1a + salp1b) / 2;
        calp1 = (calp1a + calp1b) / 2;
        t = net.sf.geographiclib.GeoMath.hypot(salp1, calp1);
        salp1 /= t;
        calp1 /= t;
        tripn = false;
        tripb = (Math.abs(salp1a - salp1) + (calp1a - calp1) <
                 net.sf.geographiclib.Accuracy.getInstance().tolb() ||
                 Math.abs(salp1 - salp1b) + (calp1 - calp1b) <
                 net.sf.geographiclib.Accuracy.getInstance().tolb());
      }
      nvals = this.Lengths(eps, sig12,
          ssig1, csig1, dn1, ssig2, csig2, dn2,
          cbet1, cbet2,
                           (outmask & net.sf.geographiclib.GeodesicMask.
                            getInstance().GEODESICSCALE) != 0,
          C1a, C2a);
      s12x = nvals.s12b;
      m12x = nvals.m12b;
      if ((outmask & net.sf.geographiclib.GeodesicMask.
           getInstance().GEODESICSCALE) != 0) {
        vals.M12 = nvals.M12;
        vals.M21 = nvals.M21;
      }
      m12x *= this._b;
      s12x *= this._b;
      vals.a12 = sig12 / net.sf.geographiclib.GeoMath.degree;
      omg12 = lam12 - omg12;
    }
  }
  if (outmask &
          net.sf.geographiclib.GeodesicMask.getInstance().DISTANCE)
    vals.s12 = 0 + s12x;
  if (outmask &
      net.sf.geographiclib.GeodesicMask.
      getInstance().REDUCEDLENGTH)
    vals.m12 = 0 + m12x;
  if (outmask &
          net.sf.geographiclib.GeodesicMask.getInstance().AREA) {
    var
        salp0 = salp1 * cbet1,
        calp0 = net.sf.geographiclib.GeoMath.hypot(calp1, salp1 * sbet1);
    var alp12;
    if (calp0 != 0 && salp0 != 0) {
      var
          ssig1 = sbet1,
          csig1 = calp1 * cbet1,
          ssig2 = sbet2,
          csig2 = calp2 * cbet2,
          k2 = net.sf.geographiclib.GeoMath.sq(calp0) * this._ep2,
          eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
      var A4 = net.sf.geographiclib.GeoMath.sq(this._a) *
          calp0 * salp0 * this._e2;
      t = net.sf.geographiclib.GeoMath.hypot(ssig1, csig1);
      ssig1 /= t;
      csig1 /= t;
      t = net.sf.geographiclib.GeoMath.hypot(ssig2, csig2);
      ssig2 /= t;
      csig2 /= t;
      var C4a =
          new Array(net.sf.geographiclib.Accuracy.getInstance().nc4());
      this.C4f(eps, C4a);
      var
          B41 = net.sf.geographiclib.Geodesic.SinCosSeries(
          false, ssig1, csig1, C4a,
          net.sf.geographiclib.Accuracy.getInstance().nc4()),
          B42 = net.sf.geographiclib.Geodesic.SinCosSeries(
          false, ssig2, csig2, C4a,
          net.sf.geographiclib.Accuracy.getInstance().nc4());
      vals.S12 = A4 * (B42 - B41);
    } else
      vals.S12 = 0;
    if (!meridian &&
        omg12 < 0.75 * Math.PI &&
        sbet2 - sbet1 < 1.75) {
      var
          somg12 = Math.sin(omg12),
          domg12 = 1 + Math.cos(omg12),
          dbet1 = 1 + cbet1,
          dbet2 = 1 + cbet2;
      alp12 = 2 * Math.atan2(somg12 * (sbet1 * dbet2 + sbet2 * dbet1),
                             domg12 * (sbet1 * sbet2 + dbet1 * dbet2));
    } else {
      var
          salp12 = salp2 * calp1 - calp2 * salp1,
          calp12 = calp2 * calp1 + salp2 * salp1;
      if (salp12 == 0 && calp12 < 0) {
        salp12 = net.sf.geographiclib.Accuracy.getInstance().tiny() * calp1;
        calp12 = -1;
      }
      alp12 = Math.atan2(salp12, calp12);
    }
    vals.S12 += this._c2 * alp12;
    vals.S12 *= swapp * lonsign * latsign;
    vals.S12 += 0;
  }
  if (swapp < 0) {
    t = salp1;
    salp1 = salp2;
    salp2 = t;
    t = calp1;
    calp1 = calp2;
    calp2 = t;
    if (outmask &
        net.sf.geographiclib.GeodesicMask.
        getInstance().GEODESICSCALE) {
      t = vals.M12;
      vals.M12 = vals.M21;
      vals.M21 = t;
    }
  }
  salp1 *= swapp * lonsign;
  calp1 *= swapp * latsign;
  salp2 *= swapp * lonsign;
  calp2 *= swapp * latsign;
  if (outmask &
          net.sf.geographiclib.GeodesicMask.getInstance().AZIMUTH) {
    vals.azi1 = 0 - Math.atan2(-salp1, calp1) /
        net.sf.geographiclib.GeoMath.degree;
    vals.azi2 = 0 - Math.atan2(-salp2, calp2) /
        net.sf.geographiclib.GeoMath.degree;
  }
  return vals;
};
