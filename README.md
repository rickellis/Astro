# Astro

Solar and Lunar Astronomical Calculation Library written in Javascript

Astro is a fork of Fabio Soldati's excellent [MeeusJS](https://github.com/Fabiz/MeeusJs) library, with the addition of some simplified interfaces and helper functions.

In addition, this fork contains one major function from the [SunCalc](https://github.com/mourner/suncalc) library by Vladimir Agafonkin that allow us to gather a variety of solar times (dawn, dusk, nadir, solar noon, golden hour, etc.)

The original MeeusJS library is an implementation of algorithms from the second edition of 'Astronomical Algorithms of Jean Meeus'.

Why the fork? 

Meeus is a modular multi-file library that consists of one super object with 15 child objects for each category of formulas. In order to arrive at a desired result you must build a "recipe" of methods, one that often feeds the result of one object into another.

For example, to get solar position data using the original library required three separate function calls:

    var jdo = new A.JulianDay(new Date())
    var coord = A.EclCoord.fromWgs84(lat, lon)
    var tp = A.Solar.topocentricPosition(jdo, coord, true)

Using Astro, the above result only requires only one function call:

    var sunpos = A.get.sunPosition(new Date, lat, lon)

I also added additional return data types to some of the methods for convenience. For example, solar and lunar azimuth is available in degrees rather than only radians. Lunar distance is provided both in miles and kilometers. That sort of thing to make working wiht Astro very fast. 

What prompted me to fork this library is I was building a [Hologram](https://gethologram.com) widget that displayed solar and lunar informaiton. I tested a few libraries and found limitaitions in each one. I ended up using both MeeusJS and SunCalc and writing a few additional routines. It worked, but it wasn't the cleanest approach so I built Astro. 

---

## Usage

To get started fast, look at the [examples.html](https://github.com/rickellis/Astro/blob/main/examples.html) file.

----

### Sun Position

Returns horizontal and equatorial solar coordinates.

    // Los Angeles
    var lon = 34.05361
    var lat = -118.24550

    var sunpos = A.get.sunPosition(new Date, lat, lon)

    //  Takes the following arguments:
    //      object: A Javascript date object.
    //      integer: Latitude
    //      integer: Longitude
    //      integer: Optional height above sea level, in meters
    // 
    //  Returns an object with:
    //  {
    //      azimuthInRads: Azimuth in radians
    //      azimuthInDegs: Azimuth in corrected degrees. 0˚ N, 90˚ E, 180˚ S, 270˚ W
    //      altitudeInRads: Altitude in radians
    //      altitudeInDegs: Altitude in degrees. 0° horizon, +90° zenith, −90° is nadir (down).
    //      ascension: Right ascension in radians
    //      declination: Declination in radians
    //  }

---

### Moon Position

Returns horizontal and equatorial lunar coordinates, along with delta and paralactic angle.

    var lon = 34.05361
    var lat = -118.24550

    var moonpos = A.get.moonPosition(new Date, lat, lon)

    //  Takes the following arguments:
    //      object: A Javascript date object.
    //      integer: Latitude
    //      integer: Longitude
    //      integer: Optional height above sea level, in meters
    //
    //  Returns an object with:
    //    {
    //      azimuthInRads: Azimuth in radians
    //      azimuthInDegs: Azimuth in corrected degrees. 0˚ N, 90˚ E, 180˚ S, 270˚ W
    //      altitudeInRads: Altitude in radians
    //      altitudeInDegs: Altitude in degrees. 0° horizon, +90° zenith, −90° is nadir (down).
    //      ascension: Right ascension in radians
    //      declination: Declination in radians
    //      delta: Distance between centers of the Earth and Moon, in km
    //      paralacticAngle: In radians 
    //    }

---

### Lunar Distance

Distance of the moon in either miles or kilometers.

    var lon = 34.05361
    var lat = -118.24550

    var dist = A.get.lunarDistance(new Date, lat, lon)

    //  Takes the following arguments:
    //      object: A Javascript date object.
    //      number: options number of decimal places to show
    //      bool: Whether to format the number with commas
    //
    //  Returns an object with:
    //  {
    //      kilometers: Distance to the moon in kilometers
    //      miles: Distance to the moon in miles
    //  }



---


### Moon Illumination

Moon phase and illumination percentage.

    var lon = 34.05361
    var lat = -118.24550

    var illum = A.get.moonIllumination(new Date, lat, lon)

    //  Returns an object with:
    //  {
    //      phaseAngle: The illuminated fraction of the moon in radians
    //      illumination: The percentage of the illuminated area of the disk
    //      phase: moon phase as a number between 0 and 1. See below for meaning:
    //  }
    //
    //      0.0 = New Moon
    //      0.125 = Waxing Crescent
    //      0.25 = First Quarter
    //      0.375 = Waxing Gibbous
    //      0.5	= Full Moon
    //      62.5 = Waning Gibbous
    //      0.75 = Last Quarter
    //      0.875 = Waning Crescent

---

### Sun Times

Returns solar sunrise, sunset, and transit times.

    var lon = 34.05361
    var lat = -118.24550

    var times = A.get.sunTimes(new Date, lat, lon)

    //  Takes the following arguments:
    //      object: A Javascript date object.
    //      integer: Latitude
    //      integer: Longitude
    //      integer: Optional height above sea level, in meters
    //
    //  Returns an object with:
    //  {
    //      sunrise: Sunrise time in Unix
    //      transit: The length of time the sun is above the horizon, in seconds
    //      sunset: Sunset time in Unix
    //  }


---

### Sun Times All

Returns a variety of solar times.

    var lon = 34.05361
    var lat = -118.24550

    var times = A.get.sunTimesAll(new Date, lat, lon)

    //  Takes the following arguments:
    //      object: A Javascript date object.
    //      integer: Latitude
    //      integer: Longitude
    //      integer: Optional height above sea level, in meters
    //
    //  Returns an object with:
    //  {
    //      dawn: date object
    //      dusk: date object
    //      goldenHourAmEnd: date object
    //      goldenHourAmStart: date object
    //      goldenHourPmEnd: date object
    //      goldenHourPmStart: date object
    //      nadir: date object
    //      solarNoon: date object
    //      sunrise: date object
    //      sunset: date object
    //      transit: date object
    //      dayLength: String in "HH:MM:SS"
    //      nightLength: String in "HH:MM:SS"
    //  }

---

### Moon Times

Moonrise, moonset, and transit times.

    var lon = 34.05361
    var lat = -118.24550

    var times = A.get.moonTimes(new Date, lat, lon)

    //  Takes the following arguments:
    //      object: A Javascript date object.
    //      integer: Latitude
    //      integer: Longitude
    //      integer: Optional height above sea level, in meters
    //
    //  Returns an object with:
    //  {
    //      moonrise: Sunrise time in Unix
    //      transit: The length of time the sun is above the horizon, in seconds
    //      moonset: Sunset time in Unix
    //  }

---

### Summer Solstice

Longest day of the year - when the sun is at its most northerly excursion.

    var s = A.get.summerSolstice(2021)

    //  Takes one argument:
    //      Integer: The year
    //
    //  Returns a Javascript date object 

----


### Winter Solstice

Shortest day of the year - when the sun is at its most southerly excursion.

    var s = A.get.winterSolstice(2021)

    //  Takes one argument:
    //      Integer: The year
    //
    //  Returns a Javascript date object 

----


### Vernal Equinox

Spring equinox in March. On the equinox, the day and night are the same length. The time returned indicates the moment when a straight line following the equator travels through the center of the sun.

    var s = A.get.vernalEquinox(2021)

    //  Takes one argument:
    //      Integer: The year
    //
    //  Returns a Javascript date object 

----

### Fall Equinox

Fall Equinox in September. On the equinox, the day and night are the same length. The time returned indicates the moment when a straight line following the equator travels through the center of the sun.

    var s = A.get.fallEquinox(2021)

    //  Takes one argument:
    //      Integer: The year
    //
    //  Returns a Javascript date object 

----

### Radians To Degrees

Converts rads to degrees, and optionally maintains positive or negative value.

    A.Util.radiansToDegrees(rads, false)

    //  Takes the following arguments:
    //      Integer: The value in radians you wish to convert
    //      bool: Whether to preserve the sign. i.e. negative radians returns negative degrees
    //
    //  Returns an integer in degrees

---

### Invert a Degree

In other words, 60˚ becomes 240˚. Or 120˚ becomes 300˚.

    A.Util.invertDegree(180)

    //  Takes one argument:
    //      Integer: The value in degrees you wish to flip
    //
    //  Returns an integer in degrees

---

### Number with Commas

    A.Util.numberWithCommas(456254256)

    // Becomes 456,254,256

    //  Takes one argument:
    //      Integer: The value in degrees you wish to format
    //
    //  Returns a number

---


## License

MIT

Copyright 2020 Rick Ellis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.