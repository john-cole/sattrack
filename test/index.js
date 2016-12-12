'use strict';

var assert = require('assert');
var sattrack = require('../lib');
var moment = require('moment-timezone');

describe('sattrack', function () {

  var location = {
    lat: 34.6233,
    lon: -86.5364
  };

  var testdate = new Date(2016, 10, 24);

  it('should calculate a dusk range', function () {

    var daterange = sattrack.duskRange(testdate, location);

    // https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=dusk+11%2F24%2F2016+huntsville%2C+al
    // 5:04PM
    // range is -15 to +120
    assert.equal('November 24, 2016 4:50 PM', daterange[0].format('LLL'));
    assert.equal('November 24, 2016 7:05 PM', daterange[1].format('LLL'));
  });

  function testvisible(tle, date, check) {
    // Time: Mon Aug 15 8:34 PM, Visible: 3 min, Max Height: 58°, Appears: 23° above NNW, Disappears: 25° above ESE
    var daterange = sattrack.duskRange(date, location);
    assert.equal('Mon Aug 15 2016 19:46:59 GMT-0500,Mon Aug 15 2016 22:01:59 GMT-0500', daterange.toString());

    var track = sattrack.visible(tle, {
      range: daterange.map(d => d.toDate()),
      location: location
    });

    check(track);
  }

  function isscheck(track) {
    assert.equal('8:33:59 PM', moment(track.time).format('LTS'));
    assert.equal('19.756852', track.sat.alt.toFixed(6));
    assert.equal('325.767463', track.sat.az.toFixed(6));
  }

  it('should find ISS with a TLE string', function () {
    var tle = `Sample ISS TLE Data
1 25544U 98067A   16228.46489348  .00016717  00000-0  10270-3 0  9035
2 25544  51.6431 122.2483 0001572 125.1874 234.9426 15.55014495 14203;
`;
    testvisible(tle, new Date(2016, 7, 15, 8, 34), isscheck);
  });

  it('should find ISS with a TLE array', function () {
    var tle = ['Sample ISS TLE Data   ', '1 25544U 98067A   16228.46489348  .00016717  00000-0  10270-3 0  9035',
      '2 25544  51.6431 122.2483 0001572 125.1874 234.9426 15.55014495 14203'
    ];

    testvisible(tle, new Date(2016, 7, 15, 8, 34), isscheck);
  });

  it('should predict ISS with a TLE string', function () {
    var tle = `Sample ISS TLE Data
1 25544U 98067A   16228.46489348  .00016717  00000-0  10270-3 0  9035
2 25544  51.6431 122.2483 0001572 125.1874 234.9426 15.55014495 14203;
`;
    testvisible(tle, new Date(2016, 7, 15, 8, 34), isscheck);
  });

  it('should predict TIANGONG 1', function () {
    var tle = `TIANGONG 1
  1 37820U 11053A   16328.42196759  .00018109  00000-0  15313-3 0  9998
  2 37820  42.7632  10.8547 0015415  65.4349 129.7468 15.69249090295545`;

    // https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=dusk%2012%2F3%2F2016%20huntsville%2C%20al 5:03pm
    var daterange = sattrack.duskRange(new Date(2016, 11, 3), location);
    assert.equal('Sat Dec 03 2016 16:49:27 GMT-0600,Sat Dec 03 2016 19:04:27 GMT-0600', daterange.toString());

    // Dec 3, 6:33pm az:243
    var track = sattrack.visible(tle, {
      range: daterange.map(d => d.toDate()),
      location: location
    });

    assert.equal('12/03/2016 6:33:57 PM', moment(track.time).format('L LTS'));
    assert.equal('15.145535', track.sat.alt.toFixed(6));
    assert.equal('244.369855', track.sat.az.toFixed(6));
  });


});