# Astro

Solar and Lunar Astronomical Calculation Library written in Javascript

Astro is a fork of Fabio Soldati's excellent [MeeusJS](https://github.com/Fabiz/MeeusJs) library. It also contains one major function from the [SunCalc](https://github.com/mourner/suncalc) library by Vladimir Agafonkin. I added to the library and built simplified interfaces.

Why the fork?

I was creating a [Hologram](https://gethologram.com/widgets/orbitron-5000) widget that displays solar and lunar informaiton. I tested a few libraries and found limitations in each one, so I ended up using both MeeusJS and SunCalc together and writing additional functions. It worked, but it wasn't the cleanest approach.

I had two goals for Asto. First, I wanted a complete library that had all the commonly neneded solar and lunar calculations. The second goal was a library with very simple interfaces for fast development. 

For example, to get solar position data using MeeusJS requires this:

    var jdo = new A.JulianDay(new Date())
    var coord = A.EclCoord.fromWgs84(lat, lon)
    var tp = A.Solar.topocentricPosition(jdo, coord, true)

Using Astro only requires only one function call:

    var sunpos = A.get.sunPosition(new Date, lat, lon)

Asto's methods also provides additional return data types for convenience. For example, solar and lunar azimuth is also available in degrees rather than only radian, so that there is less post-processing necessary for the developer. 


---

## Usage

The [examples.html](https://github.com/rickellis/Astro/blob/main/examples.html) file will let you run all the below functions.

----

### Sun Position

Returns horizontal and equatorial solar coordinates.

    // Los Angeles
    var lon = 34.05361
    var lat = -118.24550

    var sunpos = A.get.sunPosition(new Date, lat, lon)

Takes four arguments:

    object: A Javascript date object.
    integer: Latitude
    integer: Longitude
    integer: Optional height above sea level, in meters


Returns an object containing:

    {
        azimuthInRads: Azimuth in radians
        azimuthInDegs: Azimuth in corrected degrees. 0˚ N, 90˚ E, 180˚ S, 270˚ W
        altitudeInRads: Altitude in radians
        altitudeInDegs: Altitude in degrees. 0° horizon, +90° zenith, −90° is nadir (down).
        ascension: Right ascension in radians
        declination: Declination in radians
    }

---

### Moon Position

Returns horizontal and equatorial lunar coordinates, along with delta and paralactic angle.

    var lon = 34.05361
    var lat = -118.24550

    var moonpos = A.get.moonPosition(new Date, lat, lon)

Takes four arguments:

    object: A Javascript date object.
    integer: Latitude
    integer: Longitude
    integer: Optional height above sea level, in meters

Returns an object with:

    {
        azimuthInRads: Azimuth in radians
        azimuthInDegs: Azimuth in corrected degrees. 0˚ N, 90˚ E, 180˚ S, 270˚ W
        altitudeInRads: Altitude in radians
        altitudeInDegs: Altitude in degrees. 0° horizon, +90° zenith, −90° is nadir (down).
        ascension: Right ascension in radians
        declination: Declination in radians
        delta: Distance between centers of the Earth and Moon, in km
        paralacticAngle: In radians 
    }


---

### Lunar Distance

Distance of the moon in either miles or kilometers.

    var lon = 34.05361
    var lat = -118.24550

    var dist = A.get.lunarDistance(new Date, 2, true)

Takes the following arguments:

    object: A Javascript date object.
    number: options number of decimal places to show
    bool: Whether to format the number with commas

Returns an object with:

    {
        kilometers: Distance to the moon in kilometers
        miles: Distance to the moon in miles
    }

---


### Moon Illumination

Moon phase and illumination percentage.

    var lon = 34.05361
    var lat = -118.24550

    var illum = A.get.moonIllumination(new Date, lat, lon)


Takes the following arguments:

    object: A Javascript date object.
    integer: Latitude
    integer: Longitude
    integer: Optional height above sea level, in meters

Returns an object containing:

    {
        phaseAngle: The illuminated fraction of the moon in radians
        illumination: The percentage of the illuminated area of the disk
        phase: moon phase as a number between 0 and 1. See below for meaning:
    }

**Moon phases**

    0.0 = New Moon
    0.125 = Waxing Crescent
    0.25 = First Quarter
    0.375 = Waxing Gibbous
    0.5	= Full Moon
    62.5 = Waning Gibbous
    0.75 = Last Quarter
    0.875 = Waning Crescent

---

### Sun Times

Returns solar sunrise, sunset, and transit times.

    var lon = 34.05361
    var lat = -118.24550

    var times = A.get.sunTimes(new Date, lat, lon)

Takes the following arguments:

    object: A Javascript date object.
    integer: Latitude
    integer: Longitude
    integer: Optional height above sea level, in meters

Returns an object containing:

    {
        sunrise: Sunrise time in Unix
        transit: The length of time the sun is above the horizon, in seconds
        sunset: Sunset time in Unix
    }


---

### Sun Times All

Returns a variety of solar times.

    var lon = 34.05361
    var lat = -118.24550

    var times = A.get.sunTimesAll(new Date, lat, lon)

Takes four arguments:

    object: A Javascript date object.
    integer: Latitude
    integer: Longitude
    integer: Optional height above sea level, in meters

Returns an object containing:

    {
        dawn: date object
        dusk: date object
        goldenHourAmEnd: date object
        goldenHourAmStart: date object
        goldenHourPmEnd: date object
        goldenHourPmStart: date object
        nadir: date object
        solarNoon: date object
        sunrise: date object
        sunset: date object
        transit: date object
        dayLength: String in "HH:MM:SS"
        nightLength: String in "HH:MM:SS"
    }

---

### Moon Times

Moonrise, moonset, and transit times.

    var lon = 34.05361
    var lat = -118.24550

    var times = A.get.moonTimes(new Date, lat, lon)

Takes four arguments:

    object: A Javascript date object.
    integer: Latitude
    integer: Longitude
    integer: Optional height above sea level, in meters

Returns an object containing:

    {
        moonrise: Sunrise time in Unix
        transit: The length of time the sun is above the horizon, in seconds
        moonset: Sunset time in Unix
    }

---

### Summer Solstice

Longest day of the year - when the sun is at its most northerly excursion.

    var s = A.get.summerSolstice(2021)

Takes one argument:

    Integer: The year

Returns a Javascript date object 

----


### Winter Solstice

Shortest day of the year - when the sun is at its most southerly excursion.

    var s = A.get.winterSolstice(2021)

Takes one argument:

    Integer: The year

Returns a Javascript date object 

----


### Vernal Equinox

Spring equinox in March. On the equinox, the day and night are the same length. The time returned indicates the moment when a straight line following the equator travels through the center of the sun.

    var s = A.get.vernalEquinox(2021)

Takes one argument:

    Integer: The year

Returns a Javascript date object 

----

### Fall Equinox

Fall Equinox in September. On the equinox, the day and night are the same length. The time returned indicates the moment when a straight line following the equator travels through the center of the sun.

    var s = A.get.fallEquinox(2021)

Takes one argument:

    Integer: The year

Returns a Javascript date object 

----

### Radians To Degrees

Converts rads to degrees, and optionally maintains positive or negative value.

    A.Util.radiansToDegrees(rads, false)

Takes two arguments:

    Integer: The value in radians you wish to convert
    bool: Whether to preserve the sign. i.e. negative radians returns negative degrees

Returns an integer in degrees

---

### Invert a Degree

In other words, 60˚ becomes 240˚. Or 120˚ becomes 300˚.

    var inv = A.Util.invertDegree(180)

Takes one argument:

    Integer: The value in degrees you wish to flip

Returns an integer in degrees

---

### Number with Commas

    var n = A.Util.numberWithCommas(456254256)

 Becomes 456,254,256

Takes one argument:

    Integer: The value in degrees you wish to format

Returns a number

---






## License

MIT

Copyright 2020 Rick Ellis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.