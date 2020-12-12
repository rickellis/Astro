// -----------------------------------------------------------------------------------
//       __   ____  ____  ____   __  
//      / _\ / ___)(_  _)(  _ \ /  \ 
//     /    \\___ \  )(   )   /(  O )
//     \_/\_/(____/ (__) (__\_) \__/ 
// 
//    Astronomical Calculation Library
// -----------------------------------------------------------------------------------
//    VERSION 1.0.1
// -----------------------------------------------------------------------------------
// 
//  Solar and Lunar Astronomical Calculation Library written in Javascript
// 
//  Astro is a fork of Fabio Soldati's excellent MeeusJS library. It also contains 
//  some components from the SunCalc library by Vladimir Agafonkin. I added some new 
//  interfaces and utility functions to the library.
// 
//  Why the fork?
// 
//  I was creating a Hologram widget that displays solar and lunar informaiton. I tested 
//  a few libraries and wasn't able to find a single one that met all my needs, so I ended 
//  up using both MeeusJS and SunCalc together and writing additional functions.
//  It worked, but it wasn't the cleanest approach.
//  
//  I had two goals for Asto. First, I wanted a complete library that had all the commonly
//	neneded solar and lunar calculations. The second goal was a library with very simple 
//  interfaces for fast development. 
//  
//  For example, to get solar position data using MeeusJS requires several function calls:
// 
//	  var jdo = new A.JulianDay(new Date())
//	  var coord = A.EclCoord.fromWgs84(lat, lon)
//	  var tp = A.Solar.topocentricPosition(jdo, coord, true)
// 
//  Using Astro only requires only one function:
// 
//	  var sunpos = A.get.sunPosition(new Date, lat, lon)
// 
//  Asto's methods also provides additional return data types for convenience. For example, 
//  solar and lunar azimuth is also available in degrees rather than only radian, so that
//  there is less post-processing necessary for the developer. 
// 
// -----------------------------------------------------------------------------------
//  Authors  :   Astro   :  Rick Ellis           https://github.com/rickellis/Astro
//           :   MeeusJS :  Fabio Soldati        https://github.com/Fabiz/MeeusJs
//           :   SunCalc :  Vladimir Agafonkin   https://github.com/mourner/suncalc
//  License  :   MIT
// -----------------------------------------------------------------------------------


(function () { 'use strict';

// If using ES6 module syntax uncomment this line and comment out the above one.
// export default (function () {




	// SUPER OBJECT
	var A = {}
	
	// -----------------------------------------------------------------------------------
	//  CONSTANTS
	//  Julian and Besselian years described in chapter 21, Precession.
	//  T, Julian centuries since J2000 described in chapter 22, Nutation.
	// -----------------------------------------------------------------------------------
	
	A.VER = '1.1.0'
	// Julian date of the modified Julian date epoch.
	A.JMod = 2400000.5
	// Julian date corresponding to January 1.5, year 2000.
	A.J2000 = 2451545.0
	// Julian days of 1900.
	A.J1900 = 2415020.0
	// Julian days of B1900 (see p. 133)
	A.B1900 = 2415020.3135
	// Julian days of B1950 (see p. 133)
	A.B1950 = 2433282.4235
	// JulianYear in days.
	A.JulianYear = 365.25
	// JulianCentury in days.
	A.JulianCentury = 36525
	// BesselianYear in days.
	A.BesselianYear = 365.2421988
	// One astronomical unit in km. This is roughly the distance from Earth to the Sun.
	A.AU = 149597870
	
	// angle, morning name, evening name
	A.sunEventsArray = [
		[-0.833, 'sunriseStart', 		'sunsetStart'   ],
		[-0.3,   'sunRiseEnd',   		'sunSetStart'   ],
		[-12,    'nauticalDawn', 		'nauticalDusk'  ],
		[-18,    'nightEnd',     		'nightStart'    ],
		[-6,     'dawnStart',    		'duskStart'     ],
		[-4,     'goldenHourAmStart',	'goldenHourPmEnd'   ],
		[ 6,     'goldenHourAmEnd',    	'goldenHourPmStart' ]
	]
	
	
	
	// -----------------------------------------------------------------------------------
	//  A.Get
	// 
	//  The methods in this object are what you will most commonly use to retrieve data.
	// -----------------------------------------------------------------------------------
	
	A.Get = {
	
	
		// -----------------------------------------------------------------------------------
		//  Sun Position
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object.
		//	  integer: Latitude
		//	  integer: Longitude
		//	  integer: Optional height above sea level, in meters
		// 
		//  Returns an object with:
		//  {
		//	  azimuthInRads: In radians
		//	  azimuthInDegs: Azimuth in corrected degrees. 0˚ N, 90˚ E, 180˚ S, 270˚ W
		//	  altitude: In radians
		//	  altitudeInDegs: Altitude in degrees. 0° horizon, +90° zenith, −90° is nadir (down).
		//	  ascension: Right ascension in radians
		//	  declination: Declination in radians
		//  }
		// -----------------------------------------------------------------------------------
	
		sunPosition: function(date, lat, lon, h = 0) {
			var jdo = new A.JulianDay(date); 
			var coord = A.EclCoord.fromWgs84(lat, lon, h);
			var suntp = A.Solar.topocentricPosition(jdo, coord, true)
	
			return {
				azimuthInRads: suntp.hz.az,
				azimuthInDegs: A.Util.radiansToCorrectedDegrees(suntp.hz.az),
				altitudeInRads: suntp.hz.alt,
				altitudeInDegs: A.Util.radiansToDegrees(suntp.hz.alt, true),
				ascension: suntp.eq.ra,
				declination: suntp.eq.dec 
			}
		},
	
		// -----------------------------------------------------------------------------------
		//  Moon Position
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object.
		//	  integer: Latitude
		//	  integer: Longitude
		//	  integer: Optional height above sea level, in meters
		//
		//  Returns an object with:
		//  {
		//	  azimuthInRads: In radians
		//	  azimuthInDegs: Azimuth in corrected degrees. 0˚ N, 90˚ E, 180˚ S, 270˚ W
		//	  altitudeInRads: In radians
		//	  altitudeInDegs: Altitude in degrees. 0° horizon, +90° zenith, −90° is nadir (down).
		//	  ascension: Right ascension in radians
		//	  declination: Declination in radians
		//	  delta: Distance between centers of the Earth and Moon, in km
		//	  paralacticAngle: In radians 
		//  }
		// -----------------------------------------------------------------------------------
	
		moonPosition: function(date, lat, lon, h = 0) {
			var jdo = new A.JulianDay(date); 
			var coord = A.EclCoord.fromWgs84(lat, lon, h);
			var moontp = A.Moon.topocentricPosition(jdo, coord, true);
	
			return {
				azimuthInRads: moontp.hz.az,
				azimuthInDegs: A.Util.radiansToCorrectedDegrees(moontp.hz.az),
				altitudeInRads: moontp.hz.alt,
				altitudeInDegs: A.Util.radiansToDegrees(moontp.hz.alt, true),
				ascension: moontp.eq.ra,
				declination: moontp.eq.dec,
				delta: moontp.delta,
				paralacticAngle: moontp.q
			}
		},
	
		// -----------------------------------------------------------------------------------
		//  Lunar Distance
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object.
		//	  number: options number of decimal places to show
		//	  bool: Whether to format the number with commas
		//
		//  Returns an object with:
		//  {
		//	  kilometers: Distance to the moon in kilometers
		//	  miles: Distance to the moon in miles
		//  }
		// -----------------------------------------------------------------------------------
	
		lunarDistance: function(date, decimals = -1, format = false) {
			let julianDate = (((date.valueOf() / 86400000) - 0.5 + 2440588) - 2451545)
			let meanAnomaly = (Math.PI / 180) * (134.963 + 13.064993 * julianDate)
			let kilometers = 385001 - 20905 * Math.cos(meanAnomaly)

			let miles = kilometers / 1.6
	
			if (decimals > 0) {
				kilometers = kilometers.toFixed(decimals)
				miles = miles.toFixed(decimals)
			}
	
			kilometers = (format == true) ? A.Util.numberWithCommas(kilometers) : kilometers
			miles = (format == true) ? A.Util.numberWithCommas(miles) : miles
	
			return {
				kilometers: kilometers,
				miles: miles
			}
		},
	
		// -----------------------------------------------------------------------------------
		//  Moon Illumination
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object.
		//
		//  Returns an object with:
		//  {
		//	  phaseAngle: The illuminated fraction of the moon in radians
		//	  fraction: The ratio of the illuminated area of the disk to the total area.
		//	  illumination: The fraction turned into a percentage (ie, fraction * 100)
		//	  phase: moon phase as a number between 0 and 1. See below.
		//  }
		//
		//	  0.00 = New Moon
		//	  0.125 = Waxing Crescent
		//	  0.25 = First Quarter
		//	  0.375 = Waxing Gibbous
		//	  0.5	= Full Moon
		//	  62.5 = Waning Gibbous
		//	  0.75 = Last Quarter
		//	  0.875 = Waning Crescent
		// -----------------------------------------------------------------------------------
	
		moonIllumination: function(date) {
			var illum = A.Suncalc.getMoonIllumination(date)
			return {
				phaseAngle: illum.angle,
				fraction: illum.fraction,
				illumination: illum.fraction * 100,
				phase: illum.phase
			}
		},
	
		// -----------------------------------------------------------------------------------
		//  Moon Coordinates
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object.
		//
		//  Returns an object with:
		//  {
		//	  rightAscension: right ascension in radians
		//	  declination: declination in rads
		//	  distance: in kilometers
		//  }
		// -----------------------------------------------------------------------------------
		moonCoordinates: function(date) {
			var coords = A.Suncalc.moonCoords(date)
			return {
				rightAscdension: coords.ra,
				declination: coords.dec,
				distance: coords.dist
			}
		},
	
		// -----------------------------------------------------------------------------------
		//  Sun Times
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object.
		//	  integer: Latitude
		//	  integer: Longitude
		//	  integer: Optional height above sea level, in meters
		//
		//  Returns an object with:
		//  {
		//	  sunrise: Sunrise time in Unix
		//	  transit: The length of time the sun is above the horizon, in seconds
		//	  sunset: Sunset time in Unix
		//  }
		// -----------------------------------------------------------------------------------
	
		sunTimes: function(date, lat, lon, h = 0) {
			var jdo = new A.JulianDay(date); 
			var coord = A.EclCoord.fromWgs84(lat, lon, h);
			var suntimes = A.Solar.times(jdo, coord);
	
			return {
				sunrise: new Date(A.Util.formatISOdateString(date, suntimes.rise)),
				transit: new Date(A.Util.formatISOdateString(date, suntimes.transit)),
				sunset: new Date(A.Util.formatISOdateString(date, suntimes.set)),
			}
		},
	
		// -----------------------------------------------------------------------------------
		//  Sun Events
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object.
		//	  integer: Latitude
		//	  integer: Longitude
		//	  integer: Optional height above sea level, in meters
		//
		//  Returns an object with:
		//  {
		//	  dawn: date object
		//		nauticalDawn:  date object
		//		dawnStart:  date object
		//		goldenHourAmStart:  date object
		//		sunriseStart:  date object
		//		sunriseEnd:  date object
		//		goldenHourAmEnd:  date object
		//		transit:  date object
		//		solarNoon:  date object
		//		goldenHourPmStart:  date object
		//		sunsetStart:  date object
		//		duskStart:  date object
		//		goldenHourPmEnd:  date object
		//		nauticalDusk:  date object
		//		nightStart:  date object
		//		nadir:  date object
		//		nightEnd:  date object
		//		dayLength:  String in "HH:MM:SS"
		//		nightLength:  String in "HH:MM:SS"
		//	}
		// -----------------------------------------------------------------------------------
	
		sunEvents: function(date, lat, lon, h = 0) {
			let jdo = new A.JulianDay(date); 
			let coord = A.EclCoord.fromWgs84(lat, lon, h);
			let suntimes = A.Solar.times(jdo, coord);
			let daylight = suntimes.set - suntimes.rise
			let night = 86400 - daylight
	
			let events = A.Suncalc.sunEvents(date, lat, lon, h)
			events.transit = new Date(A.Util.formatISOdateString(date, suntimes.transit))
			events.dayLength = A.Coord.secondsToHMSStr(daylight, false)
			events.nightLength = A.Coord.secondsToHMSStr(night, false)
			return events
		},
	
		// -----------------------------------------------------------------------------------
		//  Moon Times
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object.
		//	  integer: Latitude
		//	  integer: Longitude
		//	  integer: Optional height above sea level, in meters
		//
		//  Returns an object with:
		//  {
		//	  moonrise: Sunrise time in Unix
		//	  transit: The length of time the sun is above the horizon, in seconds
		//	  moonset: Sunset time in Unix
		//  }
		// -----------------------------------------------------------------------------------
		moonTimes: function(date, lat, lon, h = 0) {
			var jdo = new A.JulianDay(date); 
			var coord = A.EclCoord.fromWgs84(lat, lon, h);
			var moontimes = A.Moon.times(jdo, coord);
	
			return {
				moonrise: new Date(A.Util.formatISOdateString(date, moontimes.rise)),
				transit: new Date(A.Util.formatISOdateString(date, moontimes.transit)),
				moonset: new Date(A.Util.formatISOdateString(date, moontimes.set)),
			}
		},
	
		// -----------------------------------------------------------------------------------
		//  Summer Solstice
		//
		//  Longest day of the year - when the sun is at its most northerly excursion
		//
		//  Takes one argument:
		//	  Integer: The year
		//
		//  Returns a Javascript date object 
		// -----------------------------------------------------------------------------------
	
		summerSolstice: function(year) {
			return A.JulianDay.jdToDate(A.Solstice.june(year))
		},
	
		// -----------------------------------------------------------------------------------
		//  Winter Solstice
		//
		//  Shortest day of the year - when the sun is at its most southerly excursion
		//
		//  Takes one argument:
		//	  Integer: The year
		//
		//  Returns a Javascript date object 
		// -----------------------------------------------------------------------------------
	
		winterSolstice: function(year) {
			return A.JulianDay.jdToDate(A.Solstice.december(year))
		},
	
		// -----------------------------------------------------------------------------------
		//  Vernal Equinox.
		//
		//  Spring equinox in March. On the equinox, the day and night are the same length. 
		//  The time returned indicates the moment when a straight line following the 
		//  equator travels through the center of the sun.
		//
		//  Takes one argument:
		//	  Integer: The year
		//
		//  Returns a Javascript date object 
		// -----------------------------------------------------------------------------------
	
		vernalEquinox: function(year) {
			return A.JulianDay.jdToDate(A.Solstice.march(year))
		},
	
		// -----------------------------------------------------------------------------------
		//  Fall Equinox.
		//
		//  Fall Equinox in September. On the equinox, the day and night are the same length. 
		//  The time returned indicates the moment when a straight line following the equator
		//  travels through the center of the sun.
		//
		//  Takes one argument:
		//	  Integer: The year
		//
		//  Returns a Javascript date object 
		// -----------------------------------------------------------------------------------
	
		fallEquinox: function(year) {
			return A.JulianDay.jdToDate(A.Solstice.september(year))
		}
	}
	
	
	// -----------------------------------------------------------------------------------
	//  A.Set
	//  Setter functions
	// -----------------------------------------------------------------------------------
	
	A.Set = {
	
		// -----------------------------------------------------------------------------------
		//  Add a Sun Event
		//
		//  This function works in conjuntion with the A.get.sunEvents() function above.
		//	It allows custom events to be added to the even array.
		// 
		//	A.Set.sunEvent(-18, 'astronomicalTwighlight' ,'astronomicalDawn')
		// 
		//	Takes 3 arguments:
		//		decimal: The solar angle (positive or negative) you wish to key the event with
		//		srtring: The name of the "rise" event
		//		string: The name of the "set" event
		//
		//  Returns null
		// -----------------------------------------------------------------------------------
		sunEvent: function (angle, riseName, setName) {
			A.sunEventsArray.push([angle, riseName, setName])
		},
	}
	
	
	// -----------------------------------------------------------------------------------
	//  A.Util
	//  A few useful methods
	// -----------------------------------------------------------------------------------
	
	A.Util = {
	
		// -----------------------------------------------------------------------------------
		//  Format ISO Date String
		// 
		//  Takes the following arguments:
		//	  object: A Javascript date object
		//	  number: The hours, minutes, seconds, represented in seconds
		//
		//  Returns an integer in degrees
		// -----------------------------------------------------------------------------------
	
		formatISOdateString: function(date, seconds) {
			var year = date.getFullYear() 
			var day = date.getDate()
			var month = date.getMonth()
			month = (month == 0) ? 1 : month + 1
			month = (month < 10) ? '0' + month : month
			day = (day < 10) ? '0' + day : day
			return year + '-' + month + '-' + day + 'T' + A.Coord.secondsToHMSStr(seconds, false) + '.000Z'
		},
	
		// -----------------------------------------------------------------------------------
		//  Radians To Degrees
		// 
		//  Takes the following arguments:
		//	  Integer: The value in radians you wish to convert
		//	  bool: Whether to preserve the sign. i.e. negative radians returns negative degrees
		//
		//  Returns an integer in degrees
		// -----------------------------------------------------------------------------------
	
		radiansToDegrees: function (rad, preserveSign = false) {
			if (preserveSign == false) {
				return rad * 180 / Math.PI
			}
			let degrees = rad * 180 / Math.PI
			// If the radians are negative or positive,
			// the degrees we convert to must match that
			let negative = (Math.sign(rad) == -1) ? true : false
			if (negative == true) {
				if (Math.sign(degrees) == 0) {
					degrees = degrees * -1
				}
			}
			else {
				// Is positive
				if (Math.sign(degrees) == -1) {
					degrees = degrees * -1
				}
			}
			return degrees
		},
	
		// -----------------------------------------------------------------------------------
		//  Radians To Corrected Degrees
		// 
		//  Converts rads to positive degrees, with north at zero
		//
		//  Takes the following arguments:
		//	  Integer: The value in radians you wish to convert
		//	  integer: An optional offset in degrees. This value is subtracted
		//
		//  Returns an integer in degrees
		// -----------------------------------------------------------------------------------
	
		radiansToCorrectedDegrees: function(rads, correction = 0) {
			var degrees = this.radiansToDegrees(rads)
			degrees = degrees - correction
			if (degrees < 0) {
				degrees = degrees + 360
				if (degrees > 360) {
					degrees = degress - 360
				}
			}
			return this.invertDegree(degrees)
		},
	
		// -----------------------------------------------------------------------------------
		//  Invert a degree
		// 
		//  In other words, 60˚ becomes 240˚
		//
		//  Takes one argument:
		//	  Integer: The value in degrees you wish to flip
		//
		//  Returns an integer in degrees
		// -----------------------------------------------------------------------------------
	
		invertDegree: function(deg) {
			return deg <= 179 ? deg + 180 : deg - 180
		},
	
		// -----------------------------------------------------------------------------------
		//  Format number with commas
		//
		//  Takes one argument:
		//	  Integer: The value in degrees you wish to format
		//
		//  Returns an integer
		// -----------------------------------------------------------------------------------
	
		numberWithCommas: function(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
	}
	
	
	// -----------------------------------------------------------------------------------
	//  The following methods are from SunCalc.js
	// -----------------------------------------------------------------------------------
	
	A.Suncalc = {
	
		toJulian: function(date) { 
			return date.valueOf() / 86400000 - 0.5 + 2440588;
		},
		fromJulian: function(j)  { 
			var dayMs = 1000 * 60 * 60 * 24
			return new Date((j + 0.5 - 2440588) * dayMs);
		},
		toDays: function(date)	{ 
			return this.toJulian(date) - 2451545;
		},
		rightAscension: function(l, b) { 
			return Math.atan2(Math.sin(l) * Math.cos(((Math.PI / 180) * 23.4397)) - Math.tan(b) * Math.sin(((Math.PI / 180) * 23.4397)), Math.cos(l));
		},
		declination: function(l, b)	{ 
			return Math.asin(Math.sin(b) * Math.cos(((Math.PI / 180) * 23.4397)) + Math.cos(b) * Math.sin(((Math.PI / 180) * 23.4397)) * Math.sin(l));
		},
		solarMeanAnomaly: function(d) { 
			return Math.PI / 180 * (357.5291 + 0.98560028 * d);
		},
		eclipticLongitude: function(M) {
			var C = Math.PI / 180 * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)), // equation of center
				P = Math.PI / 180 * 102.9372; // perihelion of the Earth
			return M + C + P + Math.PI;
		},
		julianCycle: function(d, lw) { 
			return Math.round(d - 0.0009 - lw / (2 * Math.PI));
		},
		approxTransit: function(Ht, lw, n) { 
			return 0.0009 + (Ht + lw) / (2 * Math.PI) + n;
		},
		solarTransitJ: function(ds, M, L)  { 
			return 2451545 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
		},
		hourAngle: function(h, phi, d) { 
			return Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));
		},
		observerAngle: function(height) { 
			return -2.076 * Math.sqrt(height) / 60;
		},
		// returns set time for the given sun altitude
		getSetJ: function(h, lw, phi, dec, n, M, L) {
			var w = this.hourAngle(h, phi, dec),
				a = this.approxTransit(w, lw, n);
			return this.solarTransitJ(a, M, L);
		},
		sunCoords: function(d) {
			var M = this.solarMeanAnomaly(d),
				L = this.eclipticLongitude(M);
	
			return {
				dec: this.declination(L, 0),
				ra: this.rightAscension(L, 0)
			}
		},
	
		/**
		 * Geocentric ecliptic coordinates of the moon
		 * 
		 * @function moonCoords
		 * @static
		 *
		 * @param {object} date object
		 * @return {object} 
		 */	
		moonCoords: function(d) {
	
			var rad = Math.PI / 180
			var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
				M = rad * (134.963 + 13.064993 * d), // mean anomaly
				F = rad * (93.272 + 13.229350 * d),  // mean distance
	
				l  = L + rad * 6.289 * Math.sin(M), // longitude
				b  = rad * 5.128 * Math.sin(F),     // latitude
				dt = 385001 - 20905 * Math.cos(M);  // distance to the moon in km
	
			return {
				ra: this.rightAscension(l, b),
				dec: this.declination(l, b),
				dist: dt
			}
		},
	
		/**
		 * Moon Illumination
		 * 
		 * @function getMoonIllumination
		 * @static
		 *
		 * @param {object} date object
		 * @return {object} 
		 */	
		getMoonIllumination: function (date) {
	
		var d = this.toDays(date || new Date()),
			s = this.sunCoords(d),
			m = this.moonCoords(d),
	
			sdist = 149598000, // distance from Earth to Sun in km
	
			phi = Math.acos(Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra)),
			inc = Math.atan2(sdist * Math.sin(phi), m.dist - sdist * Math.cos(phi)),
			angle = Math.atan2(Math.cos(s.dec) * Math.sin(s.ra - m.ra), Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra));
	
			return {
				fraction: (1 + Math.cos(inc)) / 2,
				phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
				angle: angle
			}
		},
	
		/**
		 * sunEvents returns an object with sun event times
		 * 
		 * @function sunEvents
		 * @static
		 *
		 * @param {object} date object
		 * @param {number} latitude
		 * @param {number} longitude
		 * @param {number} optional elevation in meters
		 * @return {object} 
		 */	
		sunEvents: function(date, lat, lng, height = 0) {
			var i
			var len
			var time
			var h0
			var Jset
			var Jrise;
			var lw = Math.PI / 180 * -lng
			var phi = Math.PI / 180 * lat
			var dh = this.observerAngle(height)
			var d = this.toDays(date)
			var n = this.julianCycle(d, lw)
			var ds = this.approxTransit(0, lw, n)
			var M = this.solarMeanAnomaly(ds)
			var L = this.eclipticLongitude(M)
			var dec = this.declination(L, 0)
			var Jnoon = this.solarTransitJ(ds, M, L)
	
			var result = {}
			for (i = 0, len = A.sunEventsArray.length; i < len; i += 1) {
				time = A.sunEventsArray[i];
				h0 = (time[0] + dh) * Math.PI / 180
				Jset = this.getSetJ(h0, lw, phi, dec, n, M, L)
				Jrise = Jnoon - (Jset - Jnoon)
				result[time[1]] = this.fromJulian(Jrise)
				result[time[2]] = this.fromJulian(Jset)
			}
			result.solarNoon = this.fromJulian(Jnoon)
			result.nadir = this.fromJulian(Jnoon - 0.5)
	
			return result
		}
	}
	
	
	
	// -----------------------------------------------------------------------------------
	//  The MeeusJS Library
	// -----------------------------------------------------------------------------------
	
	
	// -----------------------------------------------------------------------------------
	//  A.Coord
	//  Transformation of Coordinates
	//  Chapter 13
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Coord
	 */ 
	A.Coord = {
	
		/**
		 * DMSToDeg converts from parsed sexagesimal angle components to decimal degrees.
		 *
		 * @function dmsToDeg
		 * @static
		 *
		 * @param {boolean} neg`	 - set to true if negative
		 * @param {number} d - degrees
		 * @param {number} m - minutes
		 * @param {number} s - seconds
		 * @return {number} decimal degrees
		 */
		dmsToDeg: function(neg, d, m, s) {
			s = (((d*60+m)*60) + s) / 3600;	
			if (neg) {
				return -s;
			}
			return s;
		},
		
		/**
		 * Returns radian value from an angle.
		 *
		 * @function calcAngle
		 * @static
		 *
		 * @param {boolean} neg - set to true if negative
		 * @param {number} d - degrees
		 * @param {number} m - minutes
		 * @param {number} s - seconds
		 * @return {number} degrees in radians
		 */
		calcAngle: function(neg, d, m, s) {
			return A.Coord.dmsToDeg(neg, d, m, s) * Math.PI / 180;
		},
		
		/**
		 * Returns a radian value from hour, minute, and second components. 
		 *
		 * Negative values are not supported, and NewRA wraps values larger than 24
		 * to the range [0,24) hours.
		 *
		 * @function calcRA
		 * @static
		 *
		 * @param {number} h - hours
		 * @param {number} m - minutes
		 * @param {number} s - seconds
		 * @return {number} degrees in radians
		 */
		calcRA: function(h, m, s) {
			var r = A.Coord.dmsToDeg(false, h, m, s) % 24;
			return r * 15 * Math.PI / 180;
		},
	
		/**
		 * Returns a pretty formatted HMS string from the given seconds
		 *
		 * @function secondsToHMSStr
		 * @static
		 * @param {number} sec - seconds
		 * @return {string} formatted string
		 */
		secondsToHMSStr: function(sec, showDays = true) {
			var days = Math.floor(sec / 86400);
			sec = A.Math.pMod(sec, 86400);
			
			var hours = Math.floor(sec/3600) % 24;
			var minutes = Math.floor(sec/60) % 60;
			var seconds = Math.floor(sec % 60);
	
			return (days !== 0 && showDays == true ? days + "d " : "") + (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds  < 10 ? "0" : "") + seconds;	
		},
		
		/**
		 * Returns a pretty formatted HM string from the given seconds
		 *
		 * @function secondsToHMStr
		 * @static
		 * @param {number} sec - seconds
		 * @return {string} formatted string
		 */
		secondsToHMStr: function(sec, showDays = true) {
			var days = Math.floor(sec / 86400);
			sec = A.Math.pMod(sec, 86400);
			
			var hours = Math.floor(sec/3600) % 24;
			var minutes = Math.floor(sec/60) % 60;
			
			return (days !== 0  && showDays == true ? days + "d " : "") + (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;	
		},
		
		/**
		 * EqToEcl converts equatorial coordinates to ecliptic coordinates.
		 * @function eqToEcl
		 * @static
		 *
		 * @param {EqCoord} eqcoord - equatorial coordinates, in radians
		 * @param {number}	epsilon - obliquity of the ecliptic
		 *
		 * @return {EclCoord} ecliptic coordinates of observer on Earth
		 */
		eqToEcl: function(eqcoord, epsilon)  {
			var sra = Math.sin(eqcoord.ra);
			var cra = Math.cos(eqcoord.ra);
			var sdec = Math.sin(eqcoord.dec);
			var cdec = Math.cos(eqcoord.dec);
			var sepsilon = Math.sin(epsilon);
			var cepsilon = Math.cos(epsilon);
		
			return new A.EclCoord(
				Math.atan2(sra * cepsilon + (sdec / cdec) * sepsilon, cra), // (13.1) p. 93
				Math.asin(sdec * cepsilon - cdec * sepsilon * sra)	  // (13.2) p. 93
			);
		},
		
		/**
		 * EclToEq converts ecliptic coordinates to equatorial coordinates.
		 * @function eclToEq
		 * @static
		 *
		 * @param {EclCoord} latlng - ecliptic coordinates of observer on Earth
		 * @param {number}	epsilon - obliquity of the ecliptic
		 *
		 * @return {EqCoord} equatorial coordinates, in radians
		 */
		eclToEq: function(eclCoord, epsilon) {
			var slat = Math.sin(eclCoord.lat);
			var clat = Math.cos(eclCoord.lat);
			var slng = Math.sin(eclCoord.lng);
			var clng = Math.cos(eclCoord.lng);
			var sepsilon = Math.sin(epsilon);
			var cepsilon = Math.cos(epsilon);
			var ra = Math.atan2(slat * cepsilon - (slng / clng) * sepsilon, clat); // (13.3) p. 93
			if (ra < 0) {
				ra += 2 * Math.PI;
			}
			
			return new A.EqCoord(
				ra,
				Math.asin(slng * cepsilon + clng * sepsilon * slat) // (13.4) p. 93
			);
		},
		
		/**
		 * EqToHz computes Horizontal coordinates from equatorial coordinates. 
		 * Sidereal time must be consistent with the equatorial coordinates.
		 * If coordinates are apparent, sidereal time must be apparent as well.
		 *	 
		 * @function eqToHz
		 * @static
		 *
		 * @param {EqCoord} eqcoord - equatorial coordinates, in radians
		 * @param {EclCoord} latlng - ecliptic coordinates of observer on Earth
		 * @param {number} st - sidereal time at Greenwich at time of observation in radians.
		 * @return {HzCoord} horizontal coordinates, in radians
		 */
		eqToHz: function(eqcoord, eclCoord, strad)  {
			var H = strad - eclCoord.lng - eqcoord.ra;
			
			var sH = Math.sin(H);
			var cH = Math.cos(H);
			var slat = Math.sin(eclCoord.lat);
			var clat = Math.cos(eclCoord.lat);
			var sdec = Math.sin(eqcoord.dec);
			var cdec = Math.cos(eqcoord.dec);
			
		
			return new A.HzCoord(
				Math.atan2(sH, cH * slat - (sdec / cdec) * clat),  // (13.5) p. 93
				Math.asin(slat * sdec + clat * cdec * cH)		 // (13.6) p. 93
			);
		}
	};
	
	// -----------------------------------------------------------------------------------
	
	/**
	 * Represents a geographical point in ecliptic coordinates with latitude and longitude coordinates
	 * and an optional height.
	 * @constructor
	 * @param {number} lat - The latitude of the location in radians.
	 * @param {number} lng - The longitude of the location in radians. Longitudes are measured positively westward
	 * @param {?number} h - The height above the sea level.
	 */
	A.EclCoord = function (lat, lng, h) {
		
		if (isNaN(lat) || isNaN(lng)) {
			throw new Error('Invalid EclCoord object: (' + lat + ', ' + lng + ')');
		}
	
		this.lat = lat;
		this.lng = lng;
	
		if (h !== undefined) {
			this.h = h;
		}	
	};
	
	A.EclCoord.prototype = {
		/**
		 * Returns a pretty printed string in the WGS84 format.
		 * @return {String} Pretty printed string.
		 */
		toWgs84String: function () { // (Number) -> String
			return A.Math.formatNum(this.lat * 180 / Math.PI) + ', ' + A.Math.formatNum(-this.lng * 180 / Math.PI);
		}
	};
	
	/**
	 * Create a new EclCoord object from the given wgs coordinates.
	 *
	 * @param {number} lat - The latitude of the location degrees.
	 * @param {number} lng - The longitude of the location degrees.
	 * @param {?number} h - The height above the sea level.
	 */
	A.EclCoord.fromWgs84 = function(wgs84lat, wgs84lng, h) {
		return new A.EclCoord(wgs84lat * Math.PI / 180,  -wgs84lng * Math.PI / 180, h);
	};
	
	// -----------------------------------------------------------------------------------
	
	/**
	 * Represents a geographical point in equatorial coordinates with right ascension and declination.
	 * @constructor
	 * @param {number} ra - The right ascension in radians.
	 * @param {number} dec - The declination in radians.
	 */
	A.EqCoord = function (ra, dec) { // (Number, Number, Number)
		
		if (isNaN(ra) || isNaN(dec)) {
			throw new Error('Invalid EqCoord object: (' + ra + ', ' + dec + ')');
		}
	
		this.ra = ra;
		this.dec = dec;
	};
	
	A.EqCoord.prototype = {
		/**
		 * Returns a pretty printed string in degrees.
		 * @return {String} Pretty printed string.
		 */
		toString: function () { // (Number) -> String
			return "ra:" + A.Math.formatNum(this.ra * 180 / Math.PI) + ', dec:' + A.Math.formatNum(this.dec * 180 / Math.PI);
		}
	};
	
	// -----------------------------------------------------------------------------------
	
	/**
	 * Represents a geographical point in horizontal coordinates with azimuth and altitude.
	 * @constructor
	 * @param {number} az - The azimuth in radians.
	 * @param {number} alt - The altitude in radians.
	 */
	A.HzCoord = function (az, alt) { // (Number, Number, Number)
		
		if (isNaN(az) || isNaN(alt)) {
			throw new Error('Invalid HzCoord object: (' + az + ', ' + alt + ')');
		}
	
		this.az = az;
		this.alt = alt;
	};
	
	A.HzCoord.prototype = {
		/**
		 * Returns a pretty printed string in degrees.
		 * @return {String} Pretty printed string.
		 */
		toString: function () { // (Number) -> String
			return "azi:" + A.Math.formatNum(this.az * 180 / Math.PI) + ', alt:' + A.Math.formatNum(this.alt * 180 / Math.PI);
		}
	};
	
	
	// -----------------------------------------------------------------------------------
	//  A.DeltaT
	//  Dynamical Time and Universal Time
	//  Chapter 10
	//  deltaT = TD - UT, deltaT = jde - jd  
	//  TD: julian day ephemerides (jde)  
	//  UT: julian day (jd)  
	// -----------------------------------------------------------------------------------
	
	/** 
	 * @module A.DeltaT
	 */
	A.DeltaT = {
			
		/**
		 * Converts jd to jde
		 * @function jdToJde
		 * @static
		 *
		 * @param {number} jd - julian day
		 * @param {?number} deltaT - Estimate Delta T for the given date
		 * @return {number} julian day ephemerides
		 */
		jdToJde: function (jd, deltaT) {
			if (!deltaT)
				deltaT = A.DeltaT.estimate(jd);
			return jd + deltaT / 86400; 
		},
		
		/**
		 * Converts jde to jd
		 * @function jdeToJd
		 * @static
		 *
		 * @param {number} jde - julian day ephemerides
		 * @param {?number} deltaT - Estimate Delta T for the given date
		 * @return {number} julian day
		 */
		jdeToJd: function (jd, deltaT) {
			if (!deltaT)
				deltaT = A.DeltaT.estimate(jd);
			return jd - deltaT / 86400; 
		},
		
		/**
		 * Calculates the decimal year of a given julian day
		 * @function decimalYear
		 * @static
		 *
		 * @param {number} jd - julian day
		 * @return {number} decimal year
		 */
		decimalYear: function (jd) {
			var cal = A.JulianDay.jdToCalendar(jd);
			return  cal.y + (cal.m - 0.5) / 12;
		},
	
		/**
		 * Estimate Delta T for the given Calendar. This is based on Espenak and Meeus, "Five Millennium Canon of
		 * Solar Eclipses: -1999 to +3000" (NASA/TP-2006-214141).
		 * see http://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html
		 * @function estimate
		 * @static
		 *
		 * @param {number} jd - julian day
		 * @return {number} estimated delta T value (seconds) 
		 */
		estimate: function (jd) {
			var year = A.DeltaT.decimalYear(jd);
			var pow = Math.pow;
			var u, t;
			
			if (year < -500) {
				u = (year - 1820) / 100;
				return -20 + 32 * pow(u, 2);
			} 
			if (year < 500) {
				u = year / 100;
				return  10583.6 - 1014.41 * u + 33.78311 * pow(u, 2) - 5.952053 * pow(u, 3) -
						0.1798452 * pow(u, 4) + 0.022174192 * pow(u, 5) + 0.0090316521 * pow(u, 6);
			} 
			if (year < 1600) {
				u = (year - 1000) / 100;
				return  1574.2 - 556.01 * u + 71.23472 * pow(u, 2) + 0.319781 * pow(u, 3) - 
						0.8503463 * pow(u, 4) - 0.005050998 * pow(u, 5) + 0.0083572073 * pow(u, 6);
			} 
			if (year < 1700) {
				t = year - 1600;
				return  120 - 0.9808 * t - 0.01532 * pow(t, 2) + pow(t, 3) / 7129;
			} 
			if (year < 1800) {
				t = year - 1700;
				return  8.83 + 0.1603 * t - 0.0059285 * pow(t, 2) + 0.00013336 * pow(t, 3) - pow(t, 4) / 1174000;
			} 
			if (year < 1860) {
				t = year - 1800;
				return  13.72 - 0.332447 * t + 0.0068612 * pow(t, 2) + 0.0041116 * pow(t, 3) - 0.00037436 * pow(t, 4) +
						0.0000121272 * pow(t, 5) - 0.0000001699 * pow(t, 6) + 0.000000000875 * pow(t, 7);
			} 
			if (year < 1900) {
				t = year - 1860;
				return  7.62 + 0.5737 * t - 0.251754 * pow(t, 2) + 0.01680668 * pow(t, 3) -
						0.0004473624 * pow(t, 4) + pow(t, 5) / 233174;
			} 
			if (year < 1920) {
				t = year - 1900;
				return  -2.79 + 1.494119 * t - 0.0598939 * pow(t, 2) + 0.0061966 * pow(t, 3) - 0.000197 * pow(t, 4);
			} 
			if (year < 1941) {
				t = year - 1920;
				return  21.20 + 0.84493 * t - 0.076100 * pow(t, 2) + 0.0020936 * pow(t, 3);
			} 
			if (year < 1961) {
				t = year - 1950;
				return  29.07 + 0.407 * t - pow(t, 2) / 233 + pow(t, 3) / 2547;
			} 
			if (year < 1986) {
				t = year - 1975;
				return  45.45 + 1.067 * t - pow(t, 2) / 260 - pow(t, 3) / 718;
			} 
			if (year < 2005) {
				t = year - 2000;
				return  63.86 + 0.3345 * t - 0.060374 * pow(t, 2) + 0.0017275 * pow(t, 3) + 0.000651814 * pow(t, 4) +
						0.00002373599 * pow(t, 5);
			} 
			if (year < 2050) {
				t = year - 2000;
				return  62.92 + 0.32217 * t + 0.005589 * pow(t, 2);
			}  
			if (year < 2150) {
				return  -20 + 32 * pow(((year - 1820) / 100), 2) - 0.5628 * (2150 - year);
			} 
	
			// default
			u = (year - 1820) / 100;
			return  -20 + 32 * pow(u, 2);
		}
	};
	
	// -----------------------------------------------------------------------------------
	//  A.Gobe
	//  The Earth's Globe
	//  Chapter 11
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Globe
	 */
	A.Globe = {
		
		/**
		 * IAU 1976 values. Earth radius in Km.
		 * @const {number} Er
		 */
		Er: 6378.14,
		
		/**
		 * IAU 1976 values. 
		 * @const {number} Fl
		 */
		Fl: 1 / 298.257,
		
		/**
		 * ParallaxConstants computes parallax constants rho sin lat' and rho cos lat'.
		 *
		 * @function parallaxConstants
		 * @static
		 *
		 * @param {number} lat - geographic latitude in radians
		 * @param {number} h - height in meters above the ellipsoid
		 * @return {Array} rhoslat and rhoclat
		 */
		parallaxConstants : function(lat, h) {
			if (!h)
				h = 0;
			var boa = 1 - A.Globe.Fl;
			var su = Math.sin(Math.atan(boa * Math.tan(lat)));
			var cu = Math.cos(Math.atan(boa * Math.tan(lat)));
			var slat = Math.sin(lat);
			var clat = Math.cos(lat);
			
			var hoa = h * 1e-3 / A.Globe.Er;
			
			return {
				rhoslat: su*boa + hoa*slat, 
				rhoclat: cu + hoa*clat
			};
		}
	};
	
	// -----------------------------------------------------------------------------------
	//  A.Interp
	//  Interpolation
	//  Chapter 3
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Interp
	 */
	A.Interp = {
	
		/**
		 * Prepares a Len3 object from a table of three rows of x and y values.
		 * Values must be equally spaced, so only the first and last are supplied.
		 *
		 * @function newLen3
		 * @static
		 *
		 * @param {number} x1 - start value
		 * @param {number} x3 - end value
		 * @param {Array} y - must be a slice of three y values.
		 * @return {Len3} Len3 struct
		 */
		newLen3 : function (x1, x3 , y) {
			if (y.length != 3) {
				throw "Error not 3";
			}
			if (x3 == x1) {
				throw "Error no x range";
			}
			
			var a = y[1] - y[0];
			var b = y[2] - y[1];
			
			return {
				x1: x1,
				x3: x3,
				y: y,
				a: a,
				b: b,
				c: b - a,
				abSum: a + b,
				xSum: x3 + x1,
				xDiff: x3 - x1
			};
		},
	
		/**
		 * interpolates for a given value x. 
		 *
		 * @function interpolateX
		 * @static
		 *
		 * @param {Len3} d - Len3 structure
		 * @param {number} x - value x
		 * @return {number} interpolated value
		 */
		interpolateX : function(d, x) {
			var n = (2 * x - d.xSum) / d.xDiff;
			return A.Interp.interpolateN(d, n);
		},
	
		/**
		 * interpolates for a given interpolating factor n. 
		 * This is interpolation formula (3.3) 
		 * The interpolation factor n is x-x2 in units of the tabular x interval.
		 * (See Meeus p. 24.)
		 *
		 * @function interpolateN
		 * @static
		 *
		 * @param {Len3} d - Len3 structure
		 * @param {number} n - interpolation factor n
		 * @return {number} interpolated value
		 */
		interpolateN : function(d, n) {
			return d.y[1] + n * 0.5 * (d.abSum + n * d.c);
		}
	};
	
	// -----------------------------------------------------------------------------------
	//  A.JulianDay
	//  Julian Day
	//  Chapter 7
	// -----------------------------------------------------------------------------------
	
	/**
	 * Julian day.
	 * @constructor
	 * @param {number|Date} jd - The julian day or a javascript date object
	 * @param {?number} deltaT - If deltaT is already known it can be provided for performance reasons.
	 */
	A.JulianDay = function (jd, deltaT) {
		if (jd instanceof Date) {
			jd = A.JulianDay.dateToJD(jd);
		}
		this.jd = jd;	
		if (deltaT)  // if deltaT is not provided do the calculation now
			this.deltaT = deltaT;
		else
			this.deltaT = A.DeltaT.estimate(this.jd);
		this.jde = A.DeltaT.jdToJde(this.jd, this.deltaT);
	};
	
	A.JulianDay.prototype = {
		
		/**
		 * toCalendar returns the calendar date .
		 * @return {Array} y,m,d
		 */
		toCalendar: function () {
			return A.JulianDay.jdToCalendar(this.jd);
		},
		
		/**
		 * toDate returns the javascript date.
		 * @return {Date} date
		 */
		toDate: function () {
			return A.JulianDay.jdToDate(this.jd);
		},
		
		/**
		 * jdeJ2000Century returns the number of Julian centuries since J2000 from julian day.
		 * @return {number} The quantity appears as T in a number of time series.
		 */
		jdJ2000Century: function () {
			// The formula is given in a number of places in the book, for example
			// (12.1) p. 87. (22.1) p. 143. (25.1) p. 163.
			return (this.jd - A.J2000) / A.JulianCentury;
		},
		
		/**
		 * jdeJ2000Century returns the number of Julian centuries since J2000 from julian day ephemeris.
		 * @return {number} The quantity appears as T in a number of time series.
		 */
		jdeJ2000Century: function () {
			// The formula is given in a number of places in the book, for example
			// (12.1) p. 87. (22.1) p. 143. (25.1) p. 163.
			return (this.jde - A.J2000) / A.JulianCentury;
		},
		
		/**
		 * Returns a new instance 
		 * @return {A.JulianDay}
		 */
		startOfDay: function() {
			var startofday = Math.floor(this.jde - 0.5) + 0.5;
			return new A.JulianDay(startofday, this.deltaT);
		}
	};
	
	A.JulianDay.gregorianTimeStart = Date.UTC(1582, 10 - 1, 4);
	
	/**
	 * jdFromGregorian converts a Gregorian year, month, and day of month to a new Julian day object.
	 * Negative years are valid, back to JD 0.  The result is not valid for dates before JD 0.
	 *
	 * @param {number} y - year
	 * @param {number} m - month
	 * @param {number} d - day
	 * @return {A.JulianDay} julian day object
	 */
	A.JulianDay.jdFromGregorian = function (y, m, d) {
		return new A.JulianDay(A.JulianDay.jdFromGregorian(y, m, d));
	};
	
	/**
	 * jdFromJulian converts a Julian year, month, and day of month to a new Julian day object.
	 * Negative years are valid, back to JD 0.  The result is not valid for dates before JD 0.
	 *
	 * @param {number} y - year
	 * @param {number} m - month
	 * @param {number} d - day
	 * @return {A.JulianDay} julian day object
	 */
	A.JulianDay.jdFromJulian = function (y, m, d) {
		return new A.JulianDay(A.JulianDay.calendarJulianToJD(y, m, d));
	};
	
	/**
	 * jdFromJDE converts a julian day ephemeris to a new Julian day object.
	 *
	 * @param {number} jde - julian day ephemeris
	 * @param {number} m - month
	 * @param {number} d - day
	 * @return {A.JulianDay} julian day object
	 */
	A.JulianDay.jdFromJDE = function (jde) {
		var deltaT = A.DeltaT.estimate(jde);
		var jd = A.DeltaT.jdeToJd(jde, deltaT);
		return new A.JulianDay(jd, deltaT);
	};
	
	/**
	 * DateToJD takes a javascript date and converts it to a julian day number.
	 * Any time zone offset in the time. Time is ignored and the time is treated as UTC.
	 * 
	 * @param {Date} date - the date
	 * @return {number} julian day number
	 */
	A.JulianDay.dateToJD = function (date) {
		var day = date.getUTCDate() + A.JulianDay.secondsFromHMS(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()) / (24*3600);
		
		if (date.getTime() < A.JulianDay.gregorianTimeStart)
			return A.JulianDay.calendarJulianToJD(date.getUTCFullYear(), date.getUTCMonth() + 1, day);
		else
			return A.JulianDay.calendarGregorianToJD(date.getUTCFullYear(), date.getUTCMonth() + 1, day);
	};
	
	/**
	 * calendarGregorianToJD converts a Gregorian year, month, and day of month to Julian day number.
	 * Negative years are valid, back to JD 0.  The result is not valid for dates before JD 0.
	 *
	 * @param {number} y - year
	 * @param {number} m - month
	 * @param {number} d - day
	 * @return {number} julian day number
	 */
	A.JulianDay.calendarGregorianToJD = function (y, m, d) {
		if (m == 1 || m == 2) {
			y--;
			m += 12;
		}
		var a = Math.floor(y / 100);
		var b = 2 - a + Math.floor(a / 4);
		// (7.1) p. 61
		return Math.floor(36525 * ( y + 4716) / 100) +
			Math.floor(306 * (m + 1) / 10) + b + d - 1524.5;
	};
	
	/**
	 * calendarJulianToJD converts a Julian year, month, and day of month to a Julian day number.
	 * Negative years are valid, back to JD 0.  The result is not valid for dates before JD 0.
	 *
	 * @param {number} y - year
	 * @param {number} m - month
	 * @param {number} d - day
	 * @return {number} julian day number
	 */
	A.JulianDay.calendarJulianToJD = function (y, m, d) {
		if (m == 1 || m == 2) {
			y--;
			m += 12;
		}
		return Math.floor(36525 * (y + 4716) / 100) +
			Math.floor(306 * (m + 1) / 10) + d - 1524.5;
	};
	
	/**
	 *  Get the seconds from hours minutes and seconds
	 * 
	 * @param {number} h - hour
	 * @param {number} m - minutes
	 * @param {number} s - seconds
	 * @return {number} result in seconds
	 */
	A.JulianDay.secondsFromHMS = function (h, m, s) {
		return h * 3600 + m * 60 + s;
	};
	
	/**
	 * toDate returns the given julian day number for the given jd as a JavaScript date object including h,m,s.
	 * Note that this function returns a date in either the Julian or Gregorian Calendar, as appropriate.
	 *
	 * @param {number} jd - julian day number
	 * @return {Array} y,m,d
	 */
	A.JulianDay.jdToDate = function (jd) {
		var cal = A.JulianDay.jdToCalendar(jd);
		
		var mod = A.Math.modF(jd + 0.5); // zf, f
		var dayfract = mod[1];
		var sec = Math.round(dayfract * 86400);
		
		var hours = Math.floor(sec/3600) % 24;
		var minutes = Math.floor(sec/60) % 60;
		var seconds = Math.floor(sec % 60);
		
		return new Date(Date.UTC(cal.y, cal.m-1, Math.floor(cal.d), hours, minutes, seconds));
	};
	
	/**
	 * toCalendar returns the given julian day number for the given jd.
	 * Note that this function returns a date in either the Julian or Gregorian Calendar, as appropriate.
	 *
	 * @param {number} jd - julian day number
	 * @return {Array} y,m,d
	 */
	A.JulianDay.jdToCalendar = function (jd) {
		var mod = A.Math.modF(jd + 0.5); // zf, f
	
		var z = mod[0];
		var a = z;
		if (z >= 2299151) {
			var alpha = Math.floor((z * 100 - 186721625) / 3652425);
			a = z + 1 + alpha - Math.floor(alpha / 4);
		}
		var b = a + 1524;
		var c = Math.floor((b * 100 - 12210) / 36525);
		var d = Math.floor(36525 * c / 100);
		var e = Math.floor((b - d) * 1e4 / 306001);
	
		// compute return values
		var day = ((b-d)-Math.floor(306001 * e / 1e4)) + mod[1];
		var month, year;
		if (e == 14 || e == 15) 
			month = e - 13;
		else
			month = e - 1;
	
		if (month == 1 || month == 2)
			year = Math.floor(c) - 4715;
		else
			year = Math.floor(c) - 4716;
		return {
			y: year,
			m: month,
			d: day
		};
	};
	
	/**
	 * leapYearGregorian returns true if year y in the Gregorian calendar is a leap year.
	 *
	 * @param {number} y - year
	 * @return {boolean} true if leap year.
	 */
	A.JulianDay.leapYearGregorian = function (y) {
		return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
	};
	
	/**
	 * dayOfYear computes the day number within the year. 
	 * This form of the function is not specific to the Julian or Gregorian
	 * calendar, but you must tell it whether the year is a leap year.
	 *
	 * @param {number} y - year
	 * @param {number} m - month
	 * @param {number} d - day
	 * @param {boolean} leap - true if it's a leap year
	 * @return {number} day number
	 */
	A.JulianDay.dayOfYear = function (y, m, d, leap) {
		var k = 2;
		if (leap) {
			k--;
		}
		return A.JulianDay._wholeMonths(m, k) + d;
	};
	
	A.JulianDay._wholeMonths = function (m, k) {
		return Math.round(275 * m / 9 - k * ((m + 9) / 12) - 30);
	};
	
	// -----------------------------------------------------------------------------------
	//  A.Math
	//  Methods for mathematic calculations
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Math
	 */
	A.Math = {
	
		/**
		 * pMod returns a positive floating-point x mod y.
		 * For a positive argument y, it returns a value in the range [0,y).
		 * The result may not be useful if y is negative.
		 *
		 * @function pMod
		 * @static
		 *
		 * @param {number} x - the dividend 
		 * @param {number} y - the divisor
		 * @return {number} a positive modulo value
		 */
		pMod: function (x, y) {
			var r = x % y;
			if (r < 0) {
				r += y;
			}
			return r;
		},
		
		/**
		 * Modf returns integer and fractional floating-point numbers
		 * that sum to f.  Both values have the same sign as f.
		 *
		 * @function modF
		 * @static
		 *
		 * @param {number} v - number
		 * @return {Array} integer and the fractional floating-point
		 */
		modF: function (v) {
			if (v < 0) { 
				v = -v;
				return [-Math.floor(v), -(v % 1)];
			}
			else
				return [Math.floor(v), v % 1];
		},
		
		/**
		 * Horner evaluates a polynomal with coefficients c at x. The constant
		 * term is c[0]. The function panics with an empty coefficient list.
		 *
		 * @function horner
		 * @static
		 *
		 * @param {number} x - number
		 * @param {Array} c - list of coefficients
		 * @return {number} the result of the polynomal
		 */ 
		horner: function (x, c) {
			var i = c.length - 1;
			if (i <= 0)
				throw "empty array not supported";
			
			var y = c[i];
			while (i > 0) {
				i--;
				y = y*x + c[i];
			}
			return y;
		},
		
		/**
		 * Rounds the number to the given number of digits.
		 *
		 * @function formatNum
		 * @static
		 *
		 * @param {number} num - number
		 * @param {?number} digits - number of digits
		 * @return {number} the rounded number
		 */ 
		formatNum: function (num, digits) {
			var pow = Math.pow(10, digits | 4);
			return Math.round(num * pow) / pow;
		}
	};
	
	// -----------------------------------------------------------------------------------
	//  A.Moon
	//  Methods for calculations of the position and times of the moon.
	//  Chapter 14
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Moon
	 */
	A.Moon = {
			
		/**
		 * parallax returns equatorial horizontal parallax pi of the Moon.
		 * 
		 * @function parallax
		 * @static
		 *
		 * @param {number} delta - is distance between centers of the Earth and Moon, in km.
		 * @return {number} result in radians
		 */
		parallax: function(delta) {
			// p. 337
			return Math.asin(6378.14 / delta);
		},
	
		/**
		 * apparentEquatorial returns the apparent position of the moon as equatorial coordinates.
		 * 
		 * @function apparentEquatorial
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {Map} eq: the apparent position of the moon as equatorial coordinates 
		 *				delta: Distance between centers of the Earth and Moon, in km. 
		 */
		apparentEquatorial: function (jdo) {
			var moon = A.Moon.geocentricPosition(jdo);
			
			var nut = A.Nutation.nutation(jdo);
			var obliquity0 = A.Nutation.meanObliquityLaskar(jdo);
		
			var obliquity = obliquity0 + nut.deltaobliquity; // true obliquity
			var apparentlng = moon.lng + nut.deltalng; // apparent longitude
			
			var eq = A.Coord.eclToEq(new A.EclCoord(apparentlng, moon.lat), obliquity);
			
			return {
				eq: eq,
				delta: moon.delta
			};
		},
	
		/**
		 * apparentTopocentric returns the apparent position of the moon as topocentric coordinates.
		 * 
		 * @function apparentTopocentric
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of observer
		 * @param {?Number} apparent0 - apparent sidereal time at Greenwich for the given JD in radians.
		 * @return {Map} eq: the corrected apparent position of the moon as equatorial coordinates  
		 *				delta: Distance between centers of the Earth and Moon, in km. 
		 */
		apparentTopocentric: function (jdo, eclCoord, apparent0) {
			var ae = A.Moon.apparentEquatorial(jdo);
			
			// get the corrected right ascension and declination
			var pc = A.Globe.parallaxConstants(eclCoord.lat, eclCoord.h);
			var parallax = A.Moon.parallax(ae.delta);
			
			if (!apparent0) // if apparent0 is not provided do the calcuation now
				apparent0 = A.Sidereal.apparentInRa(jdo);
			
			var tc = A.Parallax.topocentric(ae.eq, parallax, pc.rhoslat, pc.rhoclat, eclCoord.lng, apparent0);
			return {
				eq: tc,
				delta: ae.delta
			};
		},
		
		/**
		 * topocentricPosition calculates topocentric position of the moon for a given viewpoint and a given julian day.
		 * 
		 * @function topocentricPosition
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of the observer
		 * @param {boolean} refraction - if true the atmospheric refraction is added to the altitude 
		 * @return {Map} hz: position of the Moon as horizontal coordinates with azimuth and altitude.
		 *				eq: position of the Moon as equatorial coordinates
		 *				delta: Distance between centers of the Earth and Moon, in km.
		 *				q: parallactic angle in radians 
		 */
		topocentricPosition: function (jdo, eclCoord, refraction) {	
			var st0 = A.Sidereal.apparentInRa(jdo);
			var aet = A.Moon.apparentTopocentric(jdo, eclCoord, st0);
			
			var hz = A.Coord.eqToHz(aet.eq, eclCoord, st0);
		
			if (refraction === true)
				hz.alt += A.Refraction.bennett2(hz.alt);
			
			var H = st0 - (eclCoord.lng + aet.eq.ra);
			var q = A.Moon.parallacticAngle(eclCoord.lat, H, aet.eq.dec);
			return {
				hz: hz,
				eq: aet.eq,
				delta: aet.delta,
				q: q
			};
		},
		
		/**
		 * approxTransit times computes UT transit time for the lunar object on a day of interest.
		 * 
		 * @function approxTransit
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of the observer
		 * @return {NumberMap} transit value in seconds. If value is negative transit was the day before.
		 */
		approxTransit: function (jdo, eclCoord) {
			var jdo0 = jdo.startOfDay(); // make sure jd is at midnight (ends with .5)
		 
			return A.Rise.approxTransit(eclCoord,  
				A.Sidereal.apparent0UT(jdo0), 
				A.Moon.apparentTopocentric(jdo0, eclCoord).eq);
		},
	
		/**
		 * approxTimes computes UT rise, transit and set times for the lunar object on a day of interest. 
		 * The function argurments do not actually include the day, but do include
		 * values computed from the day.
		 * 
		 * @function approxTimes
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of the observer
		 * @return {Map} transit, rise, set in seconds and in in the range [0,86400)
		 */
		approxTimes: function (jdo, eclCoord) {
			jdo = jdo.startOfDay(); // make sure jd is at midnight (ends with .5)
			var aet = A.Moon.apparentTopocentric(jdo, eclCoord);
			
			var parallax = A.Moon.parallax(aet.delta);
			
			var h0 = A.Rise.stdh0Lunar(parallax); 
			var Th0 = A.Sidereal.apparent0UT(jdo);
				  
			return A.Rise.approxTimes(eclCoord, h0, Th0, aet.eq);
		},
		
		/**
		 * times computes UT rise, transit and set times for the lunar object on a day of interest.
		 * This method has a higher accuarcy than approxTimes but needs more cpu power.	
		 * The function argurments do not actually include the day, but do include
		 * values computed from the day.
		 *
		 * @function times
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of the observer
		 * @return {Map} transit, rise, set in seconds and in in the range [0,86400)
		 */
		times: function (jdo, eclCoord) {
			jdo = jdo.startOfDay(); // make sure jd is at midnight (ends with .5)
			var aet1 = A.Moon.apparentTopocentric(new A.JulianDay(jdo.jd-1, jdo.deltaT), eclCoord);
			var aet2 = A.Moon.apparentTopocentric(jdo, eclCoord);
			var aet3 = A.Moon.apparentTopocentric(new A.JulianDay(jdo.jd+1, jdo.deltaT), eclCoord);
			
			var parallax = A.Moon.parallax(aet2.delta);
			var h0 = A.Rise.stdh0Lunar(parallax); 
		
			var Th0 = A.Sidereal.apparent0UT(jdo);
			
			return A.Rise.times(eclCoord, jdo.deltaT, h0, Th0, [aet1.eq, aet2.eq, aet3.eq]);
		},
		
		/**
		 * parallacticAngle q calculates the parallactic angle of the moon formula 14.1
		 * 
		 * @function parallacticAngle
		 * @static
		 *
		 * @param {number} lat - atitude of observer on Earth
		 * @param {number} H - is hour angle of observed object. st0 - ra
		 * @param {number} dec - declination of observed object.
		 * @return {number} q, result in radians
		 */
		parallacticAngle: function (lat, H, dec) {
			return Math.atan2(Math.sin(H), Math.tan(lat) * Math.cos(dec) - Math.sin(dec) * Math.cos(H));
		},
	
		/**
		 * geocentricPosition returns geocentric location of the Moon. 
		 * Results are referenced to mean equinox of date and do not include the effect of nutation.
		 * 
		 * @function geocentricPosition
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} result in radians
		 */
		geocentricPosition: function (jdo) {
			var p = Math.PI / 180;
	
			var T = jdo.jdeJ2000Century();
			var L_ = A.Math.pMod(A.Math.horner(T, [218.3164477*p, 481267.88123421*p,
				-0.0015786*p, p/538841, -p/65194000]), 2*Math.PI);
			
			var D = A.Math.pMod(A.Math.horner(T, [297.8501921*p, 445267.1114034*p,
				-0.0018819*p, p/545868, -p/113065000]), 2*Math.PI);
			var M = A.Math.pMod(A.Math.horner(T, [357.5291092*p, 35999.0502909*p,
				-0.0001535*p, p/24490000]), 2*Math.PI);
			var M_ = A.Math.pMod(A.Math.horner(T, [134.9633964*p, 477198.8675055*p,
				0.0087414*p, p/69699, -p/14712000]), 2*Math.PI);
			var F = A.Math.pMod(A.Math.horner(T, [93.272095*p, 483202.0175233*p,
				-0.0036539*p, -p/3526000, p/863310000]), 2*Math.PI);
	
			var A1 = 119.75*p + 131.849*p*T;
			var A2 = 53.09*p + 479264.29*p*T;
			var A3 = 313.45*p + 481266.484*p*T;
			var E = A.Math.horner(T, [1, -0.002516, -0.0000074]);
			var E2 = E * E;
			var suml = 3958*Math.sin(A1) + 1962*Math.sin(L_-F) + 318*Math.sin(A2);
			var sumr = 0;
			var sumb = -2235*Math.sin(L_) + 382*Math.sin(A3) + 175*Math.sin(A1-F) +
				175*Math.sin(A1+F) + 127*Math.sin(L_-M_) - 115*Math.sin(L_+M_);
	
			var i, r;
			for (i = 0; i < A.Moon.ta.length; i++) {
				// 0:D, 1:M, 2:M_, 3:F, 4:suml, 5:sumr
				r = A.Moon.ta[i];
				
				var a = D*r[0] + M*r[1] + M_*r[2] + F*r[3];
				var sa = Math.sin(a);
				var ca = Math.cos(a);
				switch (r[1]) { // M
					case 0:
						suml += r[4] * sa;
						sumr += r[5] * ca;
						break;
					case  1:
					case -1:
						suml += r[4] * sa * E;
						sumr += r[5] * ca * E;
						break;
					case  2: 
					case -2:
						suml += r[4] * sa * E2;
						sumr += r[5] * ca * E2;
						break;
					default: 
						throw "error";
				}		
			}
			
			for (i = 0; i < A.Moon.tb.length; i++) {
				// 0:D, 1:M, 2:M_, 3:F, 4:sumb	
				r = A.Moon.tb[i];
				
				var b = D*r[0] + M*r[1] + M_*r[2] + F*r[3];
				var sb = Math.sin(b);
				
				switch (r[1]) { // M
					case 0:
						sumb += r[4] * sb;
						break;
					case  1:
					case -1:
						sumb += r[4] * sb * E;
						break;
					case  2:
					case -2:
						sumb += r[4] * sb * E2;
						break;
					default: 
						throw "error";
				}
			}
	
			return {
				lng: A.Math.pMod(L_, 2*Math.PI) + suml*1e-6*p,
				lat: sumb * 1e-6 * p,
				delta: 385000.56 + sumr*1e-3
			};
		},
		
		
		/**
		 * 0:D, 1:M, 2:Mʹ, 3:F, 4:suml, 5:sumr
		 *
		 * @const {Array} ta
		 * @static
		 */
		ta: [
			[0, 0, 1, 0, 6288774, -20905355],
			[2, 0, -1, 0, 1274027, -3699111],
			[2, 0, 0, 0, 658314, -2955968],
			[0, 0, 2, 0, 213618, -569925],
	
			[0, 1, 0, 0, -185116, 48888],
			[0, 0, 0, 2, -114332, -3149],
			[2, 0, -2, 0, 58793, 246158],
			[2, -1, -1, 0, 57066, -152138],
	
			[2, 0, 1, 0, 53322, -170733],
			[2, -1, 0, 0, 45758, -204586],
			[0, 1, -1, 0, -40923, -129620],
			[1, 0, 0, 0, -34720, 108743],
	
			[0, 1, 1, 0, -30383, 104755],
			[2, 0, 0, -2, 15327, 10321],
			[0, 0, 1, 2, -12528, 0],
			[0, 0, 1, -2, 10980, 79661],
	
			[4, 0, -1, 0, 10675, -34782],
			[0, 0, 3, 0, 10034, -23210],
			[4, 0, -2, 0, 8548, -21636],
			[2, 1, -1, 0, -7888, 24208],
	
			[2, 1, 0, 0, -6766, 30824],
			[1, 0, -1, 0, -5163, -8379],
			[1, 1, 0, 0, 4987, -16675],
			[2, -1, 1, 0, 4036, -12831],
	
			[2, 0, 2, 0, 3994, -10445],
			[4, 0, 0, 0, 3861, -11650],
			[2, 0, -3, 0, 3665, 14403],
			[0, 1, -2, 0, -2689, -7003],
	
			[2, 0, -1, 2, -2602, 0],
			[2, -1, -2, 0, 2390, 10056],
			[1, 0, 1, 0, -2348, 6322],
			[2, -2, 0, 0, 2236, -9884],
	
			[0, 1, 2, 0, -2120, 5751],
			[0, 2, 0, 0, -2069, 0],
			[2, -2, -1, 0, 2048, -4950],
			[2, 0, 1, -2, -1773, 4130],
	
			[2, 0, 0, 2, -1595, 0],
			[4, -1, -1, 0, 1215, -3958],
			[0, 0, 2, 2, -1110, 0],
			[3, 0, -1, 0, -892, 3258],
	
			[2, 1, 1, 0, -810, 2616],
			[4, -1, -2, 0, 759, -1897],
			[0, 2, -1, 0, -713, -2117],
			[2, 2, -1, 0, -700, 2354],
	
			[2, 1, -2, 0, 691, 0],
			[2, -1, 0, -2, 596, 0],
			[4, 0, 1, 0, 549, -1423],
			[0, 0, 4, 0, 537, -1117],
	
			[4, -1, 0, 0, 520, -1571],
			[1, 0, -2, 0, -487, -1739],
			[2, 1, 0, -2, -399, 0],
			[0, 0, 2, -2, -381, -4421],
	
			[1, 1, 1, 0, 351, 0],
			[3, 0, -2, 0, -340, 0],
			[4, 0, -3, 0, 330, 0],
			[2, -1, 2, 0, 327, 0],
	
			[0, 2, 1, 0, -323, 1165],
			[1, 1, -1, 0, 299, 0],
			[2, 0, 3, 0, 294, 0],
			[2, 0, -1, -2, 0, 8752]
		],
	
		// 0:D, 1:M, 2:Mʹ, 3:F, 4:sumb	
		tb: [
			[0, 0, 0, 1, 5128122],
			[0, 0, 1, 1, 280602],
			[0, 0, 1, -1, 277693],
			[2, 0, 0, -1, 173237],
	
			[2, 0, -1, 1, 55413],
			[2, 0, -1, -1, 46271],
			[2, 0, 0, 1, 32573],
			[0, 0, 2, 1, 17198],
	
			[2, 0, 1, -1, 9266],
			[0, 0, 2, -1, 8822],
			[2, -1, 0, -1, 8216],
			[2, 0, -2, -1, 4324],
	
			[2, 0, 1, 1, 4200],
			[2, 1, 0, -1, -3359],
			[2, -1, -1, 1, 2463],
			[2, -1, 0, 1, 2211],
	
			[2, -1, -1, -1, 2065],
			[0, 1, -1, -1, -1870],
			[4, 0, -1, -1, 1828],
			[0, 1, 0, 1, -1794],
	
			[0, 0, 0, 3, -1749],
			[0, 1, -1, 1, -1565],
			[1, 0, 0, 1, -1491],
			[0, 1, 1, 1, -1475],
	
			[0, 1, 1, -1, -1410],
			[0, 1, 0, -1, -1344],
			[1, 0, 0, -1, -1335],
			[0, 0, 3, 1, 1107],
	
			[4, 0, 0, -1, 1021],
			[4, 0, -1, 1, 833],
	
			[0, 0, 1, -3, 777],
			[4, 0, -2, 1, 671],
			[2, 0, 0, -3, 607],
			[2, 0, 2, -1, 596],
	
			[2, -1, 1, -1, 491],
			[2, 0, -2, 1, -451],
			[0, 0, 3, -1, 439],
			[2, 0, 2, 1, 422],
	
			[2, 0, -3, -1, 421],
			[2, 1, -1, 1, -366],
			[2, 1, 0, 1, -351],
			[4, 0, 0, 1, 331],
	
			[2, -1, 1, 1, 315],
			[2, -2, 0, -1, 302],
			[0, 0, 1, 3, -283],
			[2, 1, 1, -1, -229],
	
			[1, 1, 0, -1, 223],
			[1, 1, 0, 1, 223],
			[0, 1, -2, -1, -220],
			[2, 1, -1, -1, -220],
	
			[1, 0, 1, 1, -185],
			[2, -1, -2, -1, 181],
			[0, 1, 2, 1, -177],
			[4, 0, -2, -1, 176],
	
			[4, -1, -1, -1, 166],
			[1, 0, 1, -1, -164],
			[4, 0, 1, -1, 132],
			[1, 0, -1, -1, -119],
	
			[4, -1, 0, -1, 115],
			[2, -2, 0, 1, 107]
		]	
	};
	
	// -----------------------------------------------------------------------------------
	//  A.MoonIllum
	//  Methods for calculations of the moon illumination
	//  Chapter 48
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.MoonIllum
	 */
	A.MoonIllum = {
	
		/**
		 * phaseAngleEq computes the phase angle of the Moon given equatorial coordinates.
		 * Angles must be in radians. Distances must be in the same units as each other.
		 *
		 * @function phaseAngleEq
		 * @static
		 * @param {A.EqCoord} eqcoordm - geocentric right ascension and declination of the Moon
		 * @param {number} deltam - distance Earth to the Moon
		 * @param {A.EqCoord} eqcoords - geocentric right ascension and declination of the Sun
		 * @param {number} deltam - distance Earth to the Sun 
		 *
		 * @return {number} i ist the ratio of the illuminated area of the disk to the total area
		 */
		phaseAngleEq: function (eqcoordm, deltam, eqcoords, deltas)  {
			var coselong = A.MoonIllum._coselong(eqcoordm, eqcoords);
			var elong = Math.acos(coselong);
			return Math.atan2(deltas * Math.sin(elong), deltam - deltas*coselong);
		},
	
		/**
		 * phaseAngleEq computes the phase angle of the Moon given equatorial coordinates.
		 *
		 * Angles must be in radians. Less accurate than PhaseAngleEq.
		 *
		 * @function phaseAngleEq
		 * @static
		 *
		 * @param {A.EqCoord} eqcoordm - geocentric right ascension and declination of the Moon
		 * @param {A.EqCoord} eqcoords - geocentric right ascension and declination of the Sun
		 * @return {number} i is the ratio of the illuminated area of the disk to the total area
		 */
		phaseAngleEq2: function (eqcoordm, eqcoords) {
			return Math.acos(-A.MoonIllum._coselong(eqcoordm, eqcoords));
		},
	
		/**
		 * illuminated returns the illuminated fraction of the moon. 
		 * 
		 * @function illuminated
		 * @static
		 *
		 * @param {number} i - phase angle of the moon
		 * @return {number} result k in radians
		 */
		illuminated: function(i) {
			return ((1 + Math.cos(i)) / 2);
		},
		
		/**
		 * positionAngle returns the position angle of the moons bright limb. 
		 * C in Figure on page 345.
		 *
		 * @function positionAngle
		 * @static
		 *
		 * @param {A.EqCoord} eqcoordm - geocentric right ascension and declination of the Moon
		 * @param {A.EqCoord} eqcoords - geocentric right ascension and declination of the Sun
		 * @return {number} position angle chi in radians
		 */
		positionAngle: function (eqcoordm, eqcoords) {
			var sdecm = Math.sin(eqcoordm.dec);
			var cdecm = Math.cos(eqcoordm.dec);
			var sdecs = Math.sin(eqcoords.dec);
			var cdecs = Math.cos(eqcoords.dec);
			return Math.atan2(cdecs*Math.sin(eqcoords.ra-eqcoordm.ra),
					sdecs*cdecm - cdecs*sdecm*Math.cos(eqcoords.ra-eqcoordm.ra));
		},
		
		/**
		 * cos elongation from equatorial coordinates
		 */
		_coselong: function (eqcoordm, eqcoords) {
			var sdecm = Math.sin(eqcoordm.dec);
			var cdecm = Math.cos(eqcoordm.dec);
			var sdecs = Math.sin(eqcoords.dec);
			var cdecs = Math.cos(eqcoords.dec);
			return sdecs*sdecm + cdecs*cdecm*Math.cos(eqcoords.ra-eqcoordm.ra);
		}
	};
	
	
	// -----------------------------------------------------------------------------------
	//  A.Nutation
	//  Methods for calculations of the nutation 
	//  Chapter 22
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Nutation
	 */
	A.Nutation = {
	
		/**
		 * Nutation returns nutation in longitude (deltalng) and nutation in obliquity (deltaobliquity)
		 * for a given JDE (Chapter 22, page 143). 
		 * Computation is by 1980 IAU theory, with terms < .0003' neglected. 
		 * JDE = UT + deltaT, see package deltat.
		 * 
		 * @function nutation
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} result in radians
		 */
		nutation: function (jdo) {	
			var T = jdo.jdeJ2000Century();
			var D = A.Math.horner(T,
				[297.85036, 445267.11148, -0.0019142, 1/189474]) * Math.PI / 180;
			var M = A.Math.horner(T,
				[357.52772, 35999.050340, -0.0001603, -1/300000]) * Math.PI / 180;
			var N = A.Math.horner(T,
				[134.96298, 477198.867398, 0.0086972, 1/5620]) * Math.PI / 180;
			var F = A.Math.horner(T,
				[93.27191, 483202.017538, -0.0036825, 1/327270]) * Math.PI / 180;
			var Omega = A.Math.horner(T,
				[125.04452, -1934.136261, 0.0020708, 1/450000]) * Math.PI / 180;
			
			var deltalng = 0, deltaobliquity = 0;
			
			// sum in reverse order to accumulate smaller terms first
			for (var i = A.Nutation.table22A.length - 1; i >= 0; i--) {
				var row = A.Nutation.table22A[i];
				// 0:d, 1:m, 2:n, 3:f, 4:omega, 5:s0, 6:s1, 7:c0, 8:c1
				
				var arg = row[0]*D + row[1]*M + row[2]*N + row[3]*F + row[4]*Omega;
				var s = Math.sin(arg);
				var c = Math.cos(arg); 
				deltalng += s * (row[5] + row[6]*T);
				deltaobliquity += c * (row[7] + row[8]*T);
			}
			
			return {
				deltalng: deltalng *= 0.0001 / 3600 * (Math.PI / 180),
				deltaobliquity: deltaobliquity *= 0.0001 / 3600 * (Math.PI / 180)
			};
		},
		
		/**
		 * NutationInRA returns "nutation in right ascension" or "equation of the equinoxes."
		 *
		 * @function nutationInRA
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} result in radians
		 */
		nutationInRA: function (jdo) {
			var obliquity0 = A.Nutation.meanObliquityLaskar(jdo);
			var nut = A.Nutation.nutation(jdo);
			return nut.deltalng * Math.cos(obliquity0+nut.deltaobliquity);
		},
	
		/**
		 * The true obliquity of the ecliptic is obliquity = obliquity0 + deltaobliquity where 
		 * deltaobliquity is the nutation in obliquity
		 *
		 * @function trueObliquity
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} result in radians
		 */
		trueObliquity: function (jdo) {
			var obliquity0 = A.Nutation.meanObliquityLaskar(jdo);
			var nut = A.Nutation.nutation(jdo);
			
			return obliquity0 + nut.deltaobliquity;
		},
	
		/**
		 * MeanObliquity returns mean obliquity following the IAU 1980 polynomial. 
		 * Accuracy is 1" over the range 1000 to 3000 years and 10" over the range 0 to 4000 years.
		 *
		 * @function meanObliquity
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} result in radians
		 */
		meanObliquity: function (jdo) {	
			// (22.2) p. 147
			return A.Math.horner(jdo.jdeJ2000Century(),
				[84381.448/3600*(Math.PI/180), // = A.Coord.calcAngle(false,23, 26, 21.448),
				-46.815/3600*(Math.PI/180),
				-0.00059/3600*(Math.PI/180),
				0.001813/3600*(Math.PI/180)]);
		},
	
		/**
		 * MeanObliquityLaskar returns mean obliquity following the Laskar 1986 polynomial. 
		 * Accuracy over the range 1000 to 3000 years is .01". 
		 * Accuracy over the valid date range of -8000 to +12000 years is "a few seconds."
		 *
		 * @function meanObliquityLaskar
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} result in radians
		 */
		meanObliquityLaskar: function (jdo) {
			// (22.3) p. 147
			return A.Math.horner(jdo.jdeJ2000Century()*0.01,
				[84381.448/3600*(Math.PI/180), // = A.Coord.calcAngle(false,23, 26, 21.448),
				-4680.93/3600*(Math.PI/180),
				-1.55/3600*(Math.PI/180),
				1999.25/3600*(Math.PI/180),
				-51.38/3600*(Math.PI/180),
				-249.67/3600*(Math.PI/180),
				-39.05/3600*(Math.PI/180),
				7.12/3600*(Math.PI/180),
				27.87/3600*(Math.PI/180),
				5.79/3600*(Math.PI/180),
				2.45/3600*(Math.PI/180)]);
		},
		
		/**
		 * 0:d, 1:m, 2:n, 3:f, 4:omega, 5:s0, 6:s1, 7:c0, 8:c1
		 *
		 * @const {Array} table22A
		 * @static
		 */
		table22A: [
			[0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9],
			[-2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1],
			[0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5],
			[0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5],
			[0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1],
			[0, 0, 1, 0, 0, 712, 0.1, -7, 0],
			[-2, 1, 0, 2, 2, -517, 1.2, 224, -0.6],
			[0, 0, 0, 2, 1, -386, -0.4, 200, 0],
			[0, 0, 1, 2, 2, -301, 0, 129, -0.1],
			[-2, -1, 0, 2, 2, 217, -0.5, -95, 0.3],
			[-2, 0, 1, 0, 0, -158, 0, 0, 0],
			[-2, 0, 0, 2, 1, 129, 0.1, -70, 0],
			[0, 0, -1, 2, 2, 123, 0, -53, 0],
			[2, 0, 0, 0, 0, 63, 0, 0, 0],
			[0, 0, 1, 0, 1, 63, 0.1, -33, 0],
			[2, 0, -1, 2, 2, -59, 0, 26, 0],
			[0, 0, -1, 0, 1, -58, -0.1, 32, 0],
			[0, 0, 1, 2, 1, -51, 0, 27, 0],
			[-2, 0, 2, 0, 0, 48, 0, 0, 0],
			[0, 0, -2, 2, 1, 46, 0, -24, 0],
			[2, 0, 0, 2, 2, -38, 0, 16, 0],
			[0, 0, 2, 2, 2, -31, 0, 13, 0],
			[0, 0, 2, 0, 0, 29, 0, 0, 0],
			[-2, 0, 1, 2, 2, 29, 0, -12, 0],
			[0, 0, 0, 2, 0, 26, 0, 0, 0],
			[-2, 0, 0, 2, 0, -22, 0, 0, 0],
			[0, 0, -1, 2, 1, 21, 0, -10, 0],
			[0, 2, 0, 0, 0, 17, -0.1, 0, 0],
			[2, 0, -1, 0, 1, 16, 0, -8, 0],
			[-2, 2, 0, 2, 2, -16, 0.1, 7, 0],
			[0, 1, 0, 0, 1, -15, 0, 9, 0],
			[-2, 0, 1, 0, 1, -13, 0, 7, 0],
			[0, -1, 0, 0, 1, -12, 0, 6, 0],
			[0, 0, 2, -2, 0, 11, 0, 0, 0],
			[2, 0, -1, 2, 1, -10, 0, 5, 0],
			[2, 0, 1, 2, 2, -8, 0, 3, 0],
			[0, 1, 0, 2, 2, 7, 0, -3, 0],
			[-2, 1, 1, 0, 0, -7, 0, 0, 0],
			[0, -1, 0, 2, 2, -7, 0, 3, 0],
			[2, 0, 0, 2, 1, -7, 0, 3, 0],
			[2, 0, 1, 0, 0, 6, 0, 0, 0],
			[-2, 0, 2, 2, 2, 6, 0, -3, 0],
			[-2, 0, 1, 2, 1, 6, 0, -3, 0],
			[2, 0, -2, 0, 1, -6, 0, 3, 0],
			[2, 0, 0, 0, 1, -6, 0, 3, 0],
			[0, -1, 1, 0, 0, 5, 0, 0, 0],
			[-2, -1, 0, 2, 1, -5, 0, 3, 0],
			[-2, 0, 0, 0, 1, -5, 0, 3, 0],
			[0, 0, 2, 2, 1, -5, 0, 3, 0],
			[-2, 0, 2, 0, 1, 4, 0, 0, 0],
			[-2, 1, 0, 2, 1, 4, 0, 0, 0],
			[0, 0, 1, -2, 0, 4, 0, 0, 0],
			[-1, 0, 1, 0, 0, -4, 0, 0, 0],
			[-2, 1, 0, 0, 0, -4, 0, 0, 0],
			[1, 0, 0, 0, 0, -4, 0, 0, 0],
			[0, 0, 1, 2, 0, 3, 0, 0, 0],
			[0, 0, -2, 2, 2, -3, 0, 0, 0],
			[-1, -1, 1, 0, 0, -3, 0, 0, 0],
			[0, 1, 1, 0, 0, -3, 0, 0, 0],
			[0, -1, 1, 2, 2, -3, 0, 0, 0],
			[2, -1, -1, 2, 2, -3, 0, 0, 0],
			[0, 0, 3, 2, 2, -3, 0, 0, 0],
			[2, -1, 0, 2, 2, -3, 0, 0, 0]
		]
	};
	
	// -----------------------------------------------------------------------------------
	//  A.Parallax
	//  Correction for Parallax
	//  Chapter 40
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Parallax
	 */
	A.Parallax = {
		
		/**
		 * Parallax of earth-sun. Delta for earth sun is about 1, result is parallax in radians.
		 *
		 * @const {Number} earthsunParallax
		 * @static
		 */
		earthsunParallax: 8.794 / 60 / 60 * Math.PI / 180,
		
		/**
		 * Horizontal returns equatorial horizontal parallax of a body.
		 * 
		 * @function horizontal
		 * @static
		 *
		 * @param {number} delta - is distance in AU
		 * @return {number} result in radians
		 */
		horizontal: function (delta) {
			return 8.794 / 60 / 60 * Math.PI / 180 / delta; // (40.1) p. 279
		},
		
		/**
		 * Topocentric returns topocentric positions including parallax. 
		 * Use this function for the moon calculations.
		 * 
		 * @function topocentric
		 * @static
		 *
		 * @param {A.EqCoord} eqcoord - equatorial coordinates with right ascension and declination
		 * @param {number} parallax - the parallax in radians
		 * @param {number} latsphi - parallax constants in radians (see package globe). 
		 * @param {number} latcphi - parallax constants in radians (see package globe).
		 * @param {number} lng - longitude of the observer in radians
		 * @param {number} apparent0 - sidereal apparent in radians
		 * @return {A.EqCoord} corrected observed topocentric ra and dec in radians.
		 */
		topocentric: function (eqcoord, parallax, latsphi, latcphi, lng, apparent0){
			var H = A.Math.pMod(apparent0-lng-eqcoord.ra, 2*Math.PI);
			var sparallax = Math.sin(parallax);
			var sH = Math.sin(H);
			var cH = Math.cos(H);
			var sdec = Math.sin(eqcoord.dec);
			var cdec = Math.cos(eqcoord.dec);
			var deltara = Math.atan2(-latcphi*sparallax*sH, cdec-latcphi*sparallax*cH); // (40.2) p. 279
			return new A.EqCoord(
				eqcoord.ra + deltara,
				Math.atan2((sdec-latsphi*sparallax)*Math.cos(deltara), cdec-latcphi*sparallax*cH) // (40.3) p. 279
			);
		},
	
		/**
		 * Topocentric2 returns topocentric positions including parallax. 
		 * Use this function for the solar calculations.
		 * 
		 * @function topocentric2
		 * @static
		 *
		 * @param {A.EqCoord} eqcoord - equatorial coordinates with right ascension and declination
		 * @param {number} parallax - the parallax in radians
		 * @param {number} latsphi - parallax constants in radians (see package globe). 
		 * @param {number} latcphi - parallax constants in radians (see package globe).
		 * @param {number} lng - longitude of the observer in radians
		 * @param {number} apparent0 - sidereal apparent in radians
		 * @return {A.EqCoord} corrected observed topocentric ra and dec in radians.
		 */
		topocentric2: function (eqcoord, parallax, latsphi, latcphi, lng, apparent0) {
			var H = A.Math.pMod(apparent0-lng-eqcoord.ra, 2*Math.PI);
			var sH = Math.sin(H);
			var cH = Math.cos(H);
			var sdec = Math.sin(eqcoord.dec);
			var cdec = Math.cos(eqcoord.dec);
			return new A.EqCoord(
				eqcoord.ra + -parallax * latcphi * sH / cdec,		 // (40.4) p. 280
				eqcoord.dec + -parallax * (latsphi*cdec - latcphi*cH*sdec) // (40.5) p. 280
			);
		}
	};
	
	// -----------------------------------------------------------------------------------
	//  A.Refraction
	//  Atmospheric Refraction clculations
	//  Chapter 16
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Refraction
	 */
	A.Refraction = {
		/**
		 * Bennett returns refraction for obtaining true altitude. 
		 * Results are accurate to .07 arc min from horizon to zenith. 
		 * Result is refraction to be subtracted from h0 to obtain the true altitude of the body.  
		 *
		 * @function bennett
		 * @static
		 *
		 * @param {number} h0 - must be a measured apparent altitude of a celestial body in radians.
		 * @return {number} result in radians
		 */
		bennett: function (h0)  {
			if (h0 < 0) // the following formula works for positive altitudes only.
				h0 = 0; // if h = -0.07679 a div/0 would occur.
				
			// (16.3) p. 106
			var cRad = Math.PI / 180;
			var c1 = cRad / 60;
			var c731 = 7.31 * cRad * cRad;
			var c44 = 4.4 * cRad;
			return c1 / Math.tan(h0 + c731 / (h0 + c44));
		},
	
		/**
		 * Bennett2 returns refraction for obtaining true altitude. 
		 * Similar to Bennett, but a correction is applied to give a more accurate result. 
		 * Results are accurate to .015 arc min.  Result unit is radians.
		 * 
		 * @function bennett2
		 * @static
		 *
		 * @param {number} h0 - must be a measured apparent altitude of a celestial body in radians.
		 * @return {number} result in radians
		 */
		bennett2: function(h0) {
			var cRad = Math.PI / 180;
			var cMin = 60 / cRad;
			var c06 = 0.06 / cMin;
			var c147 = 14.7 * cMin * cRad;
			var  c13 = 13 * cRad;
			var R = A.Refraction.bennett(h0);
			return R - c06 * Math.sin(c147 * R + c13);
		},
		
		/**
		 * Saemundsson returns refraction for obtaining apparent altitude.
		 * Result is refraction to be added to h to obtain the apparent altitude of the body.
		 * Results are consistent with Bennett to within 4 arc sec.
		 * 
		 * @function saemundsson
		 * @static
		 *
		 * @param {number} h - must be a computed true "airless" altitude of a celestial body in radians.
		 * @return {number} result in radians
		 */
		saemundsson: function(h) {
			// (16.4) p. 106
			var cRad = Math.PI / 180;
			var c102 = 1.02 * cRad / 60;
			var c103 = 10.3 * cRad * cRad;
			var c511 = 5.11 * cRad;
			return c102 / Math.tan(h + c103 / (h + c511));
		}		
	};
	
	// -----------------------------------------------------------------------------------
	//  A.Rise
	//  Methodes for calculating the rise, transmit, set
	//  Chapter 16
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Rise
	 */
	A.Rise = {
	
		/**
		 * Mean refraction value
		 *
		 * @const {Number} meanRefraction
		 * @static
		 */
		meanRefraction: 0.5667 * Math.PI / 180, // A.Coord.calcAngle(false, 0, 34, 0),
	
		// The standard altitude is the geometric altitude of the center of body
		// at the time of apparent rising or setting.
		
		/**
		 * The standard altitude for stellar objects
		 *
		 * @const {Number} stdh0Stellar
		 * @static
		 */
		stdh0Stellar: -0.5667 * Math.PI / 180, //A.Coord.calcAngle(true, 0, 34, 0),
		/**
		 * The standard altitude for the solar
		 *
		 * @const {Number} stdh0Solar
		 * @static
		 */
		stdh0Solar: -0.8333 * Math.PI / 180, // A.Coord.calcAngle(true, 0, 50, 0),
		
		/**
		 * The standard altitude for the moon
		 *
		 * @const {Number} stdh0LunarMean
		 * @static
		 */
		stdh0LunarMean: 0.125 * Math.PI / 180, //A.Coord.calcAngle(false, 0, 0, .125),
	
		/**
		 * Stdh0Lunar is the standard altitude of the Moon considering parallax, the
		 * Moon's horizontal parallax.
		 * 
		 * @function stdh0Lunar
		 * @static
		 *
		 * @param {number} parallax - the paralax
		 * @return {number} result in radians
		 */
		stdh0Lunar: function(parallax)  {
			return 0.7275 * parallax - A.Rise.meanRefraction;
		},
	
		/**
		 * Approximate times. 
		 * 
		 * @function circumpolar
		 * @static
		 *
		 * @param {number} name - desc
		 * @return {number} result in radians
		 */
		circumpolar: function(lat, h0, dec) {
			// Meeus works in a crazy mix of units.
			// This function and Times work with seconds of time as much as possible.
	
			// approximate local hour angle
			var slat = Math.sin(lat);
			var clat = Math.cos(lat);
			var sdec1 = Math.sin(dec);
			var cdec1 = Math.cos(dec);
			var cH0 = (Math.sin(h0) - slat * sdec1) / (clat * cdec1); // (15.1) p. 102
			if (cH0 < -1 || cH0 > 1) {
				// ErrorCircumpolar
				return null;
			}
			return cH0;
		},
		
		/**
		 * approxTransit computes approximate UT transit times for
		 * a celestial object on a day of interest. 
		 * The function argurments do not actually include the day, but do include
		 * values computed from the day.
		 * 
		 * @function approxTimes
		 * @static
		 *
		 * @param {A.EclCoord} eclcoord - ecliptic coordinates of observer on Earth
		 * @param {Number} Th0 - is apparent sidereal time at 0h UT at Greenwich
		 * @param {A.EqCoord} eqcoord - right ascension and declination of the body at 0h dynamical time for the day of interest.
		 * @return {NumberMap} transit value in seconds. If value is negative transit was the day before.
		 */
		approxTransit: function(eclcoord, Th0, eqcoord) {
			// approximate transit, rise, set times.
			// (15.2) p. 102.
			return (eqcoord.ra + eclcoord.lng) * 43200 / Math.PI - Th0;
		},
		
		/**
		 * ApproxTimes computes approximate UT rise, transit and set times for
		 * a celestial object on a day of interest. 
		 * The function argurments do not actually include the day, but do include
		 * values computed from the day.
		 * 
		 * @function approxTimes
		 * @static
		 *
		 * @param {A.EclCoord} eclcoord - ecliptic coordinates of observer on Earth
		 * @param {Number} h0 - is "standard altitude" of the body
		 * @param {Number} Th0 - is apparent sidereal time at 0h UT at Greenwich
		 * @param {A.EqCoord} eqcoord - right ascension and declination of the body at 0h dynamical time for the day of interest.
		 * @return {Map} transit, rise, set in seconds and in in the range [0,86400)
		 */
		approxTimes: function(eclcoord, h0, Th0, eqcoord) {
			
			var cH0 = A.Rise.circumpolar(eclcoord.lat, h0, eqcoord.dec); // (15.1) p. 102
			if (!cH0) 
				return null;
			
			var H0 = Math.acos(cH0) * 43200 / Math.PI;
	
			// approximate transit, rise, set times.
			// (15.2) p. 102.
			var mt = (eqcoord.ra + eclcoord.lng) * 43200 / Math.PI - Th0;
			return {
				transit: A.Math.pMod(mt, 86400),
				transitd:Math.floor(mt / 86400),
				
				rise: A.Math.pMod(mt - H0, 86400),
				rised: Math.floor((mt - H0) / 86400),
				set: A.Math.pMod(mt + H0, 86400),
				setd: Math.floor((mt + H0) / 86400)
			};
		},
		
		/**
		 * Times computes UT rise, transit and set times for a celestial object on
		 * a day of interest with a higher precision than approxTimes. 
		 * The function argurments do not actually include the day, but do include
		 * values computed from the day.
		 * 
		 * @function times
		 * @static
		 *
		 * @param {A.EclCoord} eclcoord - ecliptic coordinates of observer on Earth
		 * @param {Number} deltaT - is delta T.
		 * @param {Number} h0 - is "standard altitude" of the body
		 * @param {Number} Th0 - is apparent sidereal time at 0h UT at Greenwich
		 * @param {Array} eqcoord3 - array with 3 A.EqCoord of the body at 0h dynamical time for the day of interest.
		 * @return {Map} transit, rise, set in seconds and in in the range [0,86400)
		 */
		times: function(eclcoord, deltaT, h0, Th0, eqcoord3) {
			var at = A.Rise.approxTimes(eclcoord, h0, Th0, eqcoord3[1]);
			
			if (!at) {
				return null;
			}
			
			var d3ra = A.Interp.newLen3(-86400, 86400, [eqcoord3[0].ra, eqcoord3[1].ra, eqcoord3[2].ra]);
			var d3dec = A.Interp.newLen3(-86400, 86400, [eqcoord3[0].dec, eqcoord3[1].dec, eqcoord3[2].dec]);
		
			// adjust mTransit
			{
				var th0 = Th0+at.transit * 360.985647 / 360;
				var ra = A.Interp.interpolateX(d3ra, at.transit + deltaT);
				var H = th0 - (eclcoord.lng+ra) * 43200 / Math.PI; // H in seconds
				at.transit = A.Math.pMod(at.transit - H, 86400);
			}
			
			// adjust mRise, mSet
			var slat = Math.sin(eclcoord.lat);
			var clat = Math.cos(eclcoord.lat);
		
			function adjustRS(m) {
				var th0 = A.Math.pMod(Th0 + m * 360.985647 / 360, 86400);
				var ut = m + deltaT;
				var ra = A.Interp.interpolateX(d3ra, ut);
				var dec = A.Interp.interpolateX(d3dec, ut);
				var H = th0 * Math.PI / 43200 - (eclcoord.lng + ra); // H in rad
				var sdec = Math.sin(dec);
				var cdec = Math.cos(dec);
				
				var h = slat*sdec + clat*cdec*Math.cos(H);
				var deltam = (h-h0)/(cdec*clat*Math.sin(H)); // deltam in radians 
				return A.Math.pMod(m + deltam * 43200 / Math.PI, 86400);
			}
			at.rise = adjustRS(at.rise);
			at.set = adjustRS(at.set);
			return at;
		}
	};
	
	// -----------------------------------------------------------------------------------
	//  A.Sidereal
	//  Calculations for Sidereal Time at Greenwich
	//  Chapter 12
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Sidereal
	 */
	A.Sidereal = {
	
		/**
		 * Coefficients are those adopted in 1982 by the International Astronomical
		 * Union and are given in (12.2) p. 87.
		 *
		 * @const {Array} iau82
		 * @static
		 */
		iau82: [24110.54841, 8640184.812866, 0.093104, 0.0000062],
	
		/**
		 * jdToCFrac returns values for use in computing sidereal time at Greenwich. 
		 * Cen is centuries from J2000 of the JD at 0h UT of argument jd.  This is
		 * the value to use for evaluating the IAU sidereal time polynomial.
		 * DayFrac is the fraction of jd after 0h UT.  It is used to compute the
		 * final value of sidereal time.
		 * 
		 * @function jdToCFrac
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} fraction
		 */
		jdToCFrac: function (jdo)  {
			var mod = A.Math.modF(jdo.jd + 0.5);
			return [(new A.JulianDay(mod[0] - 0.5)).jdJ2000Century(), mod[1]];
		},
	
		/**
		 * Mean returns mean sidereal time at Greenwich for a given JD. 
		 * Computation is by IAU 1982 coefficients.
		 * 
		 * @function mean
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} seconds of time and is in the range [0,86400)
		 */
		mean: function (jdo) {
			return A.Math.pMod(A.Sidereal._mean(jdo), 86400);
		},
	
		_mean: function (jdo) {
			var m = A.Sidereal._mean0UT(jdo);
			return m.s + m.f * 1.00273790935*86400;
		},
		
		_meanInRA: function (jdo) {
			var m = A.Sidereal._mean0UT(jdo);
			return (m.s * Math.PI / 43200) + (m.f * 1.00273790935 * 2 * Math.PI);
		},
	
		/**
		 * Mean0UT returns mean sidereal time at Greenwich at 0h UT on the given JD.
		 * 
		 * @function mean0UT
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} seconds of time and is in the range [0,86400)
		 */
		mean0UT: function (jdo) {
			var m = A.Sidereal._mean0UT(jdo);
			return A.Math.pMod(m.s, 86400);
		},
	
		_mean0UT: function (jdo) {
			var cf = A.Sidereal.jdToCFrac(jdo);
			// (12.2) p. 87
			return {
				s: A.Math.horner(cf[0], A.Sidereal.iau82),
				f: cf[1]
			};
		},
		
		/**
		 * Apparent returns apparent sidereal time at Greenwich for the given JD in radians.
		 * Apparent is mean plus the nutation in right ascension.
		 * 
		 * @function apparent
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} time in radians in the range [0,2*PI)
		 */
		apparentInRa: function (jdo) {
			var s = A.Sidereal._meanInRA(jdo);				// radians of time
			var n = A.Nutation.nutationInRA(jdo);	  // angle (radians) of RA
			return A.Math.pMod(s + n, 2*Math.PI);
		},
	
		/**
		 * Apparent returns apparent sidereal time at Greenwich for the given JD.
		 * Apparent is mean plus the nutation in right ascension.
		 * 
		 * @function apparent
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} seconds of time and is in the range [0,86400)
		 */
		apparent: function (jdo) {
			var s = A.Sidereal._mean(jdo);						// seconds of time
			
			var n = A.Nutation.nutationInRA(jdo);	  // angle (radians) of RA
			var ns = n * 3600 * 180 / Math.PI / 15; // convert RA to time in seconds
			return A.Math.pMod(s + ns, 86400);
		},
		
		/**
		 * Apparent returns apparent sidereal time at local for the given JD.
		 * Apparent is mean plus the nutation in right ascension.
		 * 
		 * @function apparentLocal
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {number} lng - longitude of observer on Earth (geographic longitudes are measured positively westwards!)
		 * @return {number} seconds of time and is in the range [0,86400)
		 */
		apparentLocal: function (jdo, lng) {
			var a = A.Sidereal.apparent(jdo);
			var lngs = lng * 43200 / Math.PI;
			return A.Math.pMod(a - lngs, 86400); 
		},
		
		/**
		 * Apparent0UT returns apparent sidereal time at Greenwich at 0h UT on the given JD.
		 * 
		 * @function apparent0UT
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {number} seconds of time and is in the range [0,86400)
		 */
		apparent0UT: function (jdo) {
			
			var mod = A.Math.modF(jdo.jd + 0.5);
			var modjde = A.Math.modF(jdo.jde + 0.5);
			
			var cen = (mod[0] - 0.5 - A.J2000) / 36525;
			var s = A.Math.horner(cen, A.Sidereal.iau82) + mod[1]*1.00273790935*86400;
			var n = A.Nutation.nutationInRA(new A.JulianDay(modjde[0]));	  // angle (radians) of RA
			var ns = n * 3600 * 180 / Math.PI / 15; // convert RA to time in seconds
			return A.Math.pMod(s + ns, 86400);
		}
	};
		
	// -----------------------------------------------------------------------------------
	//  A.Solar
	//  Methods for calculating the position and times of the sun
	//  Chapter 25
	// -----------------------------------------------------------------------------------
	
	/**
	 * Methods for calculations of the position and times of the sun.
	 * @module A.Solar
	 */
	A.Solar = {
		
		/**
		 * Distance of earth-sun in km.
		 *
		 * @const {Number} earthsunDelta
		 * @static
		 */
		earthsunDelta: 149597870,
		
		/**
		 * apparentEquatorial returns the apparent position of the Sun as equatorial coordinates.
		 * 
		 * @function apparentEquatorial
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @return {A.EqCoord} the apparent position of the Sun as equatorial coordinates
		 */
		apparentEquatorial: function (jdo) {
			var T = jdo.jdJ2000Century();
			
			var Omega = A.Solar.node(T);
			var lng = A.Solar.apparentLongitude(T, Omega);
			
			// (25.8) p. 165
			var obliquity = A.Nutation.meanObliquityLaskar(jdo) + 0.00256 * Math.PI / 180 * Math.cos(Omega);
			
			var slng = Math.sin(lng);
			var clng = Math.cos(lng);
			var sobliquity = Math.sin(obliquity);
			var cobliquity = Math.cos(obliquity);
			
			return new A.EqCoord(
				Math.atan2(cobliquity*slng, clng),
				Math.asin(sobliquity * slng)
			);
		},
		
		/**
		 * apparentTopocentric returns the apparent position of the Sun as topocentric coordinates.
		 * 
		 * @function apparentTopocentric
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of observer
		 * @param {?Number} apparent0 - apparent sidereal time at Greenwich for the given JD in radians.
		 * @return {A.EqCoord} apparent position of the Sun as topocentric coordinates in ra and dec.
		 */
		apparentTopocentric: function (jdo, eclCoord, apparent0) {
			var ae = A.Solar.apparentEquatorial(jdo);
			
			// get the corrected right ascension and declination
			var pc = A.Globe.parallaxConstants(eclCoord.lat, eclCoord.h);
			
			if (!apparent0) // if apparent0 is not provided do the calcuation now
				apparent0 = A.Sidereal.apparentInRa(jdo);
			
			return A.Parallax.topocentric2(ae, A.Parallax.earthsunParallax, pc.rhoslat, pc.rhoclat, eclCoord.lng, apparent0);
		},
		
		/**
		 * topocentricPosition calculates topocentric position of the sun for a given viewpoint and a given julian day.
		 * 
		 * @function topocentricPosition
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of the observer
		 * @param {boolean} refraction - if true the atmospheric refraction is added to the altitude 
		 * @return {Map} hz: position of the Sun as horizontal coordinates with azimuth and altitude.
		 *				eq: position of the Sun as equatorial coordinates
		 */
		topocentricPosition: function (jdo, eclCoord, refraction) {	
			var st0 = A.Sidereal.apparentInRa(jdo);
			var aet = A.Solar.apparentTopocentric(jdo, eclCoord, st0);
			
			var hz = A.Coord.eqToHz(aet, eclCoord, st0);
			if (refraction === true)
				hz.alt += A.Refraction.bennett2(hz.alt);
			
			return {
				hz: hz,
				eq: aet
			};
		},
	
		/**
		 * approxTransit times computes UT transit time for the solar object on a day of interest.
		 * 
		 * @function approxTransit
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of the observer
		 * @return {NumberMap} transit value in seconds. If value is negative transit was the day before.
		 */
		approxTransit: function (jdo, eclCoord) {
			var jdo0 = jdo.startOfDay(); // make sure jd is at midnight (ends with .5)
		  
			return A.Rise.approxTransit(eclCoord,  
						A.Sidereal.apparent0UT(jdo0), 
						A.Solar.apparentTopocentric(jdo0, eclCoord));
		},
		
		/**
		 * approxTimes times computes UT rise, transit and set times for the solar object on a day of interest. 
		 * The function argurments do not actually include the day, but do include
		 * values computed from the day.
		 * 
		 * @function approxTimes
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of the observer
		 * @return {Map} transit, rise, set in seconds and in in the range [0,86400)
		 */
		approxTimes: function (jdo, eclCoord) {
			var jdo0 = jdo.startOfDay(); // make sure jd is at midnight (ends with .5)
			var aet = A.Solar.apparentTopocentric(jdo0, eclCoord);
			
			var h0 = A.Rise.stdh0Solar; 
			var Th0 = A.Sidereal.apparent0UT(jdo0);
				  
			return A.Rise.approxTimes(eclCoord, h0, Th0, aet);
		},
		
		/**
		 * times computes UT rise, transit and set times for the solar object on a day of interest.
		 * This method has a higher accuarcy than approxTimes but needs more cpu power.	
		 * The function argurments do not actually include the day, but do include
		 * values computed from the day.
		 * 
		 * @function times
		 * @static
		 *
		 * @param {A.JulianDay} jdo - julian day
		 * @param {A.EclCoord} eclCoord - geographic location of the observer
		 * @return {Map} transit, rise, set in seconds and in in the range [0,86400)
		 */
		times: function (jdo, eclCoord) {
			var jdo0 = jdo.startOfDay(); // make sure jd is at midnight (ends with .5)
			var aet1 = A.Solar.apparentTopocentric(new A.JulianDay(jdo0.jd-1, jdo0.deltaT), eclCoord);
			var aet2 = A.Solar.apparentTopocentric(jdo0, eclCoord);
			var aet3 = A.Solar.apparentTopocentric(new A.JulianDay(jdo0.jd+1, jdo0.deltaT), eclCoord);
				
			var h0 = A.Rise.stdh0Solar; // stdh0Stellar
			var Th0 = A.Sidereal.apparent0UT(jdo0);
			
			return A.Rise.times(eclCoord, jdo0.deltaT, h0, Th0, [aet1, aet2, aet3]);
		},
		
		/**
		 * meanAnomaly returns the mean anomaly of Earth at the given T.
		 * 
		 * @function meanAnomaly
		 * @static
		 *
		 * @param {number} T - is the number of Julian centuries since J2000. See base.J2000Century.
		 * @return {number} is in radians and is not normalized to the range 0..2PI
		 */
		meanAnomaly: function (T)  {
			// (25.3) p. 163
			return A.Math.horner(T, [357.52911, 35999.05029, -0.0001537]) * Math.PI / 180;
		},
		
		/**
		 * trueLongitude returns true geometric longitude and anomaly of the sun referenced to the mean equinox of date.
		 * 
		 * @function trueLongitude
		 * @static
		 *
		 * @param {number} T - is the number of Julian centuries since J2000. See base.J2000Century.
		 * @return {Map} values in radians; s = true geometric longitude, ν = true anomaly
		 */
		trueLongitude: function (T)  {
			// (25.2) p. 163
			var L0 = A.Math.horner(T, [280.46646, 36000.76983, 0.0003032]) *
				Math.PI / 180;
			var M = A.Solar.meanAnomaly(T);
			var C = (A.Math.horner(T, [1.914602, -0.004817, -0.000014])*
					Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
					0.000289 * Math.sin(3 * M)) * Math.PI / 180;
	
			return {
				s: A.Math.pMod(L0 + C, 2 * Math.PI),
				v: A.Math.pMod(M + C, 2 * Math.PI)
			};
		},
		 
		/**
		 * apparentLongitude returns apparent longitude of the Sun referenced to the true equinox of date.
		 * 
		 * @function apparentLongitude
		 * @static
		 *
		 * @param {number} T - is the number of Julian centuries since J2000. See base.J2000Century.
		 * @return {number} result includes correction for nutation and aberration.  Unit is radians.
		 */
		apparentLongitude: function (T, Omega)  {
			if (!Omega)
				Omega = A.Solar.node(T);
			var t = A.Solar.trueLongitude(T);
			return t.s - 0.00569 * Math.PI / 180 - 0.00478 * Math.PI / 180 * Math.sin(Omega);
		},
	
		/**
		 * node returns the omega value
		 * 
		 * @function node
		 * @static
		 *
		 * @param {number} T - is the number of Julian centuries since J2000. See base.J2000Century.
		 * @return {number} result in radians
		 */
		node: function(T)  {
			return (125.04 - 1934.136 * T) * Math.PI / 180;
		},
	}
	
	// -----------------------------------------------------------------------------------
	//  A.Solstice
	//  Methods for calculating the equinixes and Solstices of the sun 
	//  Chapter 27
	//  Accuracy is within one minute of time for the years 1951-2050.
	//  Results are valid for the years -1000 to +3000. But also quite good for before -1000
	// -----------------------------------------------------------------------------------
	
	/**
	 * @module A.Solstice
	 */
	A.Solstice = {
		
		/**
		 * March returns the JDE of the March equinox for the given year.
		 *
		 * @function march
		 * @static
		 *
		 * @param {number} y - year
		 * @return {number} julian day ephemeris
		 */
		march: function(y) {
			if (y < 1000) {
				return A.Solstice._eq(y, A.Solstice.mc0);
			}
			return A.Solstice._eq(y-2000, A.Solstice.mc2);
		},
	
		/**
		 * june returns the JDE of the March equinox for the given year.
		 *
		 * @function june
		 * @static
		 *
		 * @param {number} y - year
		 * @return {number} julian day ephemeris
		 */
		june: function(y) {
			if (y < 1000) {
				return A.Solstice._eq(y, A.Solstice.jc0);
			}
			return A.Solstice._eq(y-2000, A.Solstice.jc2);
		},
	
		/**
		 * september returns the JDE of the March equinox for the given year.
		 *
		 * @function september
		 * @static
		 *
		 * @param {number} y - year
		 * @return {number} julian day ephemeris
		 */
		september: function(y) {
			if (y < 1000) {
				return A.Solstice._eq(y, A.Solstice.sc0);
			}
			return A.Solstice._eq(y-2000, A.Solstice.sc2);
		},
	
		/**
		 * december returns the JDE of the March equinox for the given year.
		 *
		 * @function december
		 * @static
		 *
		 * @param {number} y - year
		 * @return {number} julian day ephemeris
		 */
		december: function(y) {
			if (y < 1000) {
				return A.Solstice._eq(y, A.Solstice.dc0);
			}
			return A.Solstice._eq(y-2000, A.Solstice.dc2);
		},
	
		_eq: function(y, c) {
			var J0 = A.Math.horner(y*0.001, c);
			
			var T = (J0 - A.J2000) / A.JulianCentury; // calc J2000 century;
			
			var W = 35999.373 * Math.PI/180 * T - 2.47 * Math.PI/180;
			var deltatheta = 1 + 0.0334*Math.cos(W) + 0.0007*Math.cos(2*W);
			var S = 0;
			for (var i = this.terms.length - 1; i >= 0; i--) {
				var t = this.terms[i];
				S += t[0] * Math.cos((t[1]+t[2]*T)*Math.PI/180);
			}
			return J0 + 0.00001*S/deltatheta;
		},
		
		mc0: [1721139.29189, 365242.13740, 0.06134, 0.00111, -0.00071],
		jc0: [1721233.25401, 365241.72562, -0.05232, 0.00907, 0.00025],
		sc0: [1721325.70455, 365242.49558, -0.11677, -0.00297, 0.00074],
		dc0: [1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006],
	
		mc2: [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057],
		jc2: [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],
		sc2: [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],
		dc2: [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032],
		
		/**
		 * 0:a, 1:b, 2:c
		 *
		 * @const {Array} terms
		 * @static
		 */
		terms: [
			[485, 324.96, 1934.136],
			[203, 337.23, 32964.467],
			[199, 342.08, 20.186],
			[182, 27.85, 445267.112],
			[156, 73.14, 45036.886],
			[136, 171.52, 22518.443],
			[77, 222.54, 65928.934],
			[74, 296.72, 3034.906],
			[70, 243.58, 9037.513],
			[58, 119.81, 33718.147],
			[52, 297.17, 150.678],
			[50, 21.02, 2281.226],
	
			[45, 247.54, 29929.562],
			[44, 325.15, 31555.956],
			[29, 60.93, 4443.417],
			[18, 155.12, 67555.328],
			[17, 288.79, 4562.452],
			[16, 198.04, 62894.029],
			[14, 199.76, 31436.921],
			[12, 95.39, 14577.848],
			[12, 287.11, 31931.756],
			[12, 320.81, 34777.259],
			[9, 227.73, 1222.114],
			[8, 15.45, 16859.074]
		]
	}
	
	
	
	// Comment this entire conditional out if using export default 
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = A;
	}
	else if (typeof define === 'function' && define.amd) {
		define(A);
	}
	else {
		window.A = A;
	}
	
	// This is needed if using ES6 export defaults at the top of the file
	return A
	}());