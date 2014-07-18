goog.provide('net.sf.geographiclib.GeoMath');



/**
 * @constructor
 */
net.sf.geographiclib.GeoMath = function() {
};


/**
 * @const
 * @type {!number}
 */
net.sf.geographiclib.GeoMath.digits = 53;


/**
 * @const
 * @type {!number}
 */
net.sf.geographiclib.GeoMath.epsilon = Math.pow(0.5, 52);


/**
 * @const
 * @type {!number}
 */
net.sf.geographiclib.GeoMath.min = Math.pow(0.5, 1022);


/**
 * @const
 * @type {!number}
 */
net.sf.geographiclib.GeoMath.degree = Math.PI / 180;


/**
 * Square a number.
 *
 * @param {!number} x
 * @return {!number}
 */
net.sf.geographiclib.GeoMath.sq = function(x) {
  return x * x;
};


/**
 * The hypotenuse function avoiding underflow and overflow.  In Java version
 * 1.5 and later, Math.hypot can be used.
 *
 * @param {!number} x
 * @param {!number} y
 * @return {!number}
 */
net.sf.geographiclib.GeoMath.hypot = function(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  var a = Math.max(x, y),
      b = Math.min(x, y) / (a ? a : 1);
  return a * Math.sqrt(1 + b * b);
};


/**
 * log(1 + <i>x</i>) accurate near <i>x</i> = 0.  In Java version 1.5 and
 * later, Math.log1p can be used.
 * <p>
 * This is taken from D. Goldberg,
 * <a href="http://dx.doi.org/10.1145/103162.103163">What every computer
 * scientist should know about floating-point arithmetic</a> (1991),
 * Theorem 4.  See also, N. J. Higham, Accuracy and Stability of Numerical
 * Algorithms, 2nd Edition (SIAM, 2002), Answer to Problem 1.5, p 528.
 *
 * @param {!number} x
 * @return {!number}
 */
net.sf.geographiclib.GeoMath.log1p = function(x) {
  var
      y = 1 + x,
      z = y - 1;
  return z == 0 ? x : x * Math.log(y) / z;
};


/**
 * The inverse hyperbolic tangent function.  This is defined in terms of
 * GeoMath.log1p(<i>x</i>) in order to maintain accuracy near <i>x</i> = 0.
 * In addition, the odd parity of the function is enforced.
 *
 * @param {!number} x
 * @return {!number}
 */
net.sf.geographiclib.GeoMath.atanh = function(x) {
  var y = Math.abs(x);
  y = net.sf.geographiclib.GeoMath.log1p(2 * y / (1 - y)) / 2;
  return x < 0 ? -y : y;
};


/**
 * The cube root function.  In Java version 1.5 and later, Math.cbrt can be
 * used.
 *
 * @param {!number} x
 * @return {!number}
 */
net.sf.geographiclib.GeoMath.cbrt = function(x) {
  var y = Math.pow(Math.abs(x), 1 / 3);
  return x < 0 ? -y : y;
};


/**
 * The error-free sum of two numbers.
 *
 * @param {!number} u
 * @param {!number} v
 * @return {{s:!number, t:!number}}
 */
net.sf.geographiclib.GeoMath.sum = function(u, v) {
  var
      s = u + v,
      up = s - v,
      vpp = s - up;
  up -= u;
  vpp -= v;
  return {
    s: s,
    t: -(up + vpp)
  };
};


/**
 * Normalize an angle (restricted input range).
 * @param {!number} x
 * @return {!number}
 */
net.sf.geographiclib.GeoMath.angNormalize = function(x) {
  return x >= 180 ? x - 360 : (x < -180 ? x + 360 : x);
};


/**
 * Normalize an arbitrary angle.
 * @param {!number} x
 * @return {!number}
 */
net.sf.geographiclib.GeoMath.angNormalize2 = function(x) {
  return net.sf.geographiclib.GeoMath.angNormalize(x % 360);
};


/**
 * Difference of two angles reduced to [&minus;180&deg;, 180&deg;]
 * @param {!number} x
 * @param {!number} y
 * @return {!number}
 */
net.sf.geographiclib.GeoMath.angDiff = function(x, y) {
  var
      d = y - x,
      yp = d + x,
      xpp = yp - d;
  yp -= y;
  xpp -= x;
  var t = xpp - yp;
  if ((d - 180) + t > 0)
    d -= 360;
  else if ((d + 180) + t <= 0)
    d += 360;
  return d + t;
};
