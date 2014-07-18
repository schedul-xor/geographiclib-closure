goog.provide('net.sf.geographiclib.Accumulator');

goog.require('net.sf.geographiclib.GeoMath');



/**
 * @constructor
 * @param {!number} s
 * @param {!number=} opt_t
 */
net.sf.geographiclib.Accumulator = function(s, opt_t) {
  this.set(s, opt_t);
};


/**
 * @param {!number} s
 * @param {!number=} opt_t
 */
net.sf.geographiclib.Accumulator.prototype.set = function(s, opt_t) {
  this._s = s;
  if (goog.isDef(opt_t)) {
    this._t = opt_t;
  }else {
    this._t = 0;
  }
};


/**
 * @param {!number=} opt_y
 * @return {!number}
 */
net.sf.geographiclib.Accumulator.prototype.sum = function(opt_y) {
  if (!goog.isDef(opt_y))
    return this._s;
  else {
    var b = new net.sf.geographiclib.Accumulator(this._s, this._t);
    b.add(opt_y);
    return b._s;
  }
};


/**
 *
 * Start is _s, _t decreasing and non-adjacent.  Sum is now (s + t + u)
 * exactly with s, t, u non-adjacent and in decreasing order (except for
 * possible zeros).  The following code tries to normalize the result.
 * Ideally, we want _s = round(s+t+u) and _u = round(s+t+u - _s).  The
 * following does an approximate job (and maintains the decreasing
 * non-adjacent property).  Here are two "failures" using 3-bit floats:
 *
 * Case 1: _s is not equal to round(s+t+u) -- off by 1 ulp
 * [12, -1] - 8 -> [4, 0, -1] -> [4, -1] = 3 should be [3, 0] = 3
 *
 * Case 2: _s+_t is not as close to s+t+u as it shold be
 * [64, 5] + 4 -> [64, 8, 1] -> [64,  8] = 72 (off by 1)
 *                       should be [80, -7] = 73 (exact)
 *
 * "Fixing" these problems is probably not worth the expense.  The
 * representation inevitably leads to small errors in the accumulated
 * values.  The additional errors illustrated here amount to 1 ulp of the
 * less significant word during each addition to the Accumulator and an
 * additional possible error of 1 ulp in the reported sum.
 *
 * Incidentally, the "ideal" representation described above is not
 * canonical, because _s = round(_s + _t) may not be true.  For example,
 * with 3-bit floats:
 *
 * [128, 16] + 1 -> [160, -16] -- 160 = round(145).
 * But [160, 0] - 16 -> [128, 16] -- 128 = round(144).
 * @param {!number} y
 */
net.sf.geographiclib.Accumulator.prototype.add = function(y) {
  var u = net.sf.geographiclib.GeoMath.sum(y, this._t);
  var v = net.sf.geographiclib.GeoMath.sum(u.s, this._s);
  u = u.t;
  this._s = v.s;
  this._t = v.t;
  if (this._s == 0)
    this._s = u;
  else
    this._t += u;
};


/**
 * Negate an accumulator.
 */
net.sf.geographiclib.Accumulator.prototype.Negate = function() {
  this._s *= -1;
  this._t *= -1;
};
