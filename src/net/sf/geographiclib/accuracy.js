goog.provide('net.sf.geographiclib.Accuracy');

goog.require('net.sf.geographiclib.GeoMath');



/**
 * @constructor
 */
net.sf.geographiclib.Accuracy = function() {
  //  this.GEOGRAPHICLIB_GEODESIC_ORDER = 6;
  this.GEOGRAPHICLIB_GEODESIC_ORDER = 2;

  this.nA1_ = this.GEOGRAPHICLIB_GEODESIC_ORDER;
  this.nC1_ = this.GEOGRAPHICLIB_GEODESIC_ORDER;
  this.nC1p_ = this.GEOGRAPHICLIB_GEODESIC_ORDER;
  this.nA2_ = this.GEOGRAPHICLIB_GEODESIC_ORDER;
  this.nC2_ = this.GEOGRAPHICLIB_GEODESIC_ORDER;
  this.nA3_ = this.GEOGRAPHICLIB_GEODESIC_ORDER;
  this.nA3x_ = this.nA3_;
  this.nC3_ = this.GEOGRAPHICLIB_GEODESIC_ORDER;
  this.nC3x_ = (this.nC3_ * (this.nC3_ - 1)) / 2;
  this.nC4_ = this.GEOGRAPHICLIB_GEODESIC_ORDER;
  this.nC4x_ = (this.nC4_ * (this.nC4_ + 1)) / 2;
  this.maxit1_ = 20;
  this.maxit2_ = this.maxit1_ + net.sf.geographiclib.GeoMath.digits + 10;
  this.tiny_ = Math.sqrt(net.sf.geographiclib.GeoMath.min);
  this.tol0_ = net.sf.geographiclib.GeoMath.epsilon;
  this.tol1_ = 200 * this.tol0_;
  this. tol2_ = Math.sqrt(this.tol0_);
  this.tolb_ = this.tol0_ * this.tol2_;
  this.xthresh_ = 1000 * this.tol2_;
};
goog.addSingletonGetter(net.sf.geographiclib.Accuracy);


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.na1 = function() {
  return this.nA1_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.nc1 = function() {
  return this.nC1_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.nc1p = function() {
  return this.nC1p_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.na2 = function() {
  return this.nA2_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.nc2 = function() {
  return this.nC2_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.na3 = function() {
  return this.nA3_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.na3x = function() {
  return this.nA3x_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.nc3 = function() {
  return this.nC3_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.nc3x = function() {
  return this.nC3x_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.nc4 = function() {
  return this.nC4_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.nc4x = function() {
  return this.nC4x_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.maxit1 = function() {
  return this.maxit1_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.maxit2 = function() {
  return this.maxit2_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.tiny = function() {
  return this.tiny_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.tol0 = function() {
  return this.tol0_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.tol1 = function() {
  return this.tol1_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.tol2 = function() {
  return this.tol2_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.tolb = function() {
  return this.tolb_;
};


/**
 * @return {!number}
 */
net.sf.geographiclib.Accuracy.prototype.xthresh = function() {
  return this.xthresh_;
};
