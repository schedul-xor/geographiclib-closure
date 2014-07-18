goog.provide('net.sf.geographiclib.GeodesicMask');



/**
 * @constructor
 */
net.sf.geographiclib.GeodesicMask = function() {
  this.CAP_NONE = 0;
  this.CAP_C1 = 1 << 0;
  this.CAP_C1p = 1 << 1;
  this.CAP_C2 = 1 << 2;
  this.CAP_C3 = 1 << 3;
  this.CAP_C4 = 1 << 4;
  this.CAP_ALL = 0x1F;
  this.OUT_ALL = 0x7F80;
  this.NONE = 0;
  this.LATITUDE = 1 << 7 | this.CAP_NONE;
  this.LONGITUDE = 1 << 8 | this.CAP_C3;
  this.AZIMUTH = 1 << 9 | this.CAP_NONE;
  this.DISTANCE = 1 << 10 | this.CAP_C1;
  this.DISTANCE_IN = 1 << 11 | this.CAP_C1 | this.CAP_C1p;
  this.REDUCEDLENGTH = 1 << 12 | this.CAP_C1 | this.CAP_C2;
  this.GEODESICSCALE = 1 << 13 | this.CAP_C1 | this.CAP_C2;
  this.AREA = 1 << 14 | this.CAP_C4;
  this.ALL = this.OUT_ALL | this.CAP_ALL;
};
goog.addSingletonGetter(net.sf.geographiclib.GeodesicMask);
