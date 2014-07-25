require('nclosure').nclosure({additionalDeps:['deps.js']});
expect = require('expect.js');

goog.require('net.sf.geographiclib.Interface');

describe('net.sf.geographiclib.Interface',function(){
  var geoInterface = net.sf.geographiclib.Interface.getInstance();

  var tokyo = [139.6916,35.6894];
  var azerbaycan = [49.867623,40.4349504];

  it('should return distance 7539893.072m between Tokyo and Azerbaycan',function(){
    var inv = geoInterface.inverse(tokyo,azerbaycan);
    expect(inv.initialBearing,-55.3823886,0.000001);
    expect(inv.finalBearing,-118.6075489,0.000001);
    expect(inv.distance,7539893.072,0.0001);
  });

  it('should return position of Azerbaycan for point with distance 7539893.072m from Tokyo and bearing -55.3823886',function(){
       var dir = geoInterface.direct(tokyo,-55.3823886,7539893.072);
    expect(dir[0],azerbaycan[0],0.00001);
    expect(dir[1],azerbaycan[1],0.00001);
  });

  it('should return position of Tokyo for point with distance 7539893.072m from Azerbaycan and bearing 118.6075489+180',function(){
       var dir = geoInterface.direct(azerbaycan,-118.6075489+180,7539893.072);
    expect(dir[0],tokyo[0],0.0000001);
    expect(dir[1],tokyo[1],0.000001);
  });

  it('should return direct position from (0,0)',function(){
    var dir = geoInterface.direct([0,0],100,200);
    expect(dir).not.to.be(undefined);
  });
});
