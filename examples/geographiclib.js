goog.require('goog.dom');
goog.require('goog.ui.Button');
goog.require('goog.ui.LabelInput');
goog.require('net.sf.geographiclib.Interface');
goog.require('ol.ellipsoid.WGS84');


// Direct problem
var directLatitude = new goog.ui.LabelInput();
directLatitude.render(goog.dom.getElement('direct_latitude'));
directLatitude.setValue('-2.533070');
var directLongitude = new goog.ui.LabelInput();
directLongitude.render(goog.dom.getElement('direct_longitude'));
directLongitude.setValue('131.620160933');
var directAzimuth = new goog.ui.LabelInput();
directAzimuth.render(goog.dom.getElement('direct_azimuth'));
directAzimuth.setValue('10');
var directDistance = new goog.ui.LabelInput();
directDistance.render(goog.dom.getElement('direct_distance'));
directDistance.setValue('1000');

var directResultLatitudeGeographiclib = new goog.ui.LabelInput();
directResultLatitudeGeographiclib.render(goog.dom.getElement('direct_result_latitude_geographiclib'));
var directResultLongitudeGeographiclib = new goog.ui.LabelInput();
directResultLongitudeGeographiclib.render(goog.dom.getElement('direct_result_longitude_geographiclib'));
var directSolveButton = new goog.ui.Button('Solve direct');
directSolveButton.render(goog.dom.getElement('solve_direct'));
goog.events.listen(directSolveButton,goog.ui.Component.EventType.ACTION,function(){
  var directLatitudeValue = Number(directLatitude.getValue());
  var directLongitudeValue = Number(directLongitude.getValue());
  var directAzimuthValue = Number(directAzimuth.getValue());
  var directDistanceValue = Number(directDistance.getValue());

  // Geographiclib
  var geographiclibInterface = net.sf.geographiclib.Interface.getInstance();
  var geoLibDirect = geographiclibInterface.direct([directLongitudeValue,directLatitudeValue],directDistanceValue,directAzimuthValue);
  directResultLatitudeGeographiclib.setValue(geoLibDirect[1]);
  directResultLongitudeGeographiclib.setValue(geoLibDirect[0]);
},true,this);


// Inverse problem
var inverseLatitudeFrom = new goog.ui.LabelInput();
inverseLatitudeFrom.render(goog.dom.getElement('inverse_latitude_from'));
inverseLatitudeFrom.setValue('-2.533070');
var inverseLongitudeFrom = new goog.ui.LabelInput();
inverseLongitudeFrom.render(goog.dom.getElement('inverse_longitude_from'));
inverseLongitudeFrom.setValue('139.620160933');
var inverseLatitudeTo = new goog.ui.LabelInput();
inverseLatitudeTo.render(goog.dom.getElement('inverse_latitude_to'));
inverseLatitudeTo.setValue('40.421022');
var inverseLongitudeTo = new goog.ui.LabelInput();
inverseLongitudeTo.render(goog.dom.getElement('inverse_longitude_to'));
inverseLongitudeTo.setValue('-3.666365');

var inverseResultFromAzimuthGeographiclib = new goog.ui.LabelInput();
inverseResultFromAzimuthGeographiclib.render(goog.dom.getElement('inverse_result_from_azimuth_geographiclib'));
var inverseResultToAzimuthGeographiclib = new goog.ui.LabelInput();
inverseResultToAzimuthGeographiclib.render(goog.dom.getElement('inverse_result_to_azimuth_geographiclib'));
var inverseResultDistanceGeographiclib = new goog.ui.LabelInput();
inverseResultDistanceGeographiclib.render(goog.dom.getElement('inverse_result_distance_geographiclib'));

var inverseSolveButton = new goog.ui.Button('Solve inverse');
inverseSolveButton.render(goog.dom.getElement('solve_inverse'));
goog.events.listen(inverseSolveButton,goog.ui.Component.EventType.ACTION,function(){
  var inverseLatitudeFromValue = Number(inverseLatitudeFrom.getValue());
  var inverseLongitudeFromValue = Number(inverseLongitudeFrom.getValue());
  var inverseLatitudeToValue = Number(inverseLatitudeTo.getValue());
  var inverseLongitudeToValue = Number(inverseLongitudeTo.getValue());

  // Geographiclib
  var geographiclibInterface = net.sf.geographiclib.Interface.getInstance();
  var geoLibInverse = geographiclibInterface.inverse([inverseLongitudeFromValue,inverseLatitudeFromValue],[inverseLongitudeToValue,inverseLatitudeToValue]);
  inverseResultFromAzimuthGeographiclib.setValue(geoLibInverse.initialBearing);
  inverseResultToAzimuthGeographiclib.setValue(geoLibInverse.finalBearing);
  inverseResultDistanceGeographiclib.setValue(geoLibInverse.distance);
});
