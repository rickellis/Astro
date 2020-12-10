# Astro

Solar and Lunar Astronomical Calculation Library written in Javascript

Astro is a fork of Fabio Soldati's excellent [MeeusJS](https://github.com/Fabiz/MeeusJs) library, with the addition of some simplified interfaces and helper functions.

In addition, this fork contains one major function from the [SunCalc](https://github.com/mourner/suncalc) library by Vladimir Agafonkin that allow us to gather a variety of solar times (dawn, dusk, nadir, solar noon, golden hour, etc.)

The original MeeusJS library is an implementation of algorithms from the second edition of 'Astronomical Algorithms of Jean Meeus'.

Why the fork? 

Meeus is a modular multi-file library that consists of one super object with 15 child objects for each category of data formulas. In order to arrive at a result you must build a "recipe" of methods, one that often feeds the result of one object into another.

For example, to get solar position data using the original library required three separate function calls:

    var jdo = new A.JulianDay(new Date())
    var coord = A.EclCoord.fromWgs84(lat, lon)
    var tp = A.Solar.topocentricPosition(jdo, coord, true)

Using Astro, the above result only requires only one function call:

    var sunpos = A.get.sunPosition(new Date, lat, lon)

What prompted me to fork this library is I was building a [Hologram](https://gethologram.com) widget that displayed solar and lunar informaiton. I tested a few libraries and found limitaitions in each one. I ended up using both MeeusJS and SunCalc and writing a few additional routines. It worked, but it wasn't the cleanest approach so I built Astro. 

---

## Usage

To get started fast, look at the [examples.html](https://github.com/rickellis/Astro/blob/main/examples.html) file.


### Sun Position

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
    //      azimuth: In radians
    //      azInDegs: Azimuth in corrected degrees. 0˚ N, 90˚ E, 180˚ S, 270˚ W
    //      altitude: In radians
    //      altInDegs: Altitude in degrees. 0° horizon, +90° zenith, −90° is nadir (down).
    //      ascension: Right ascension in radians
    //      declination: Declination in radians
    //  }

---

### Moon Position

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
    //      azimuth: In radians
    //      azInDegs: Azimuth in corrected degrees. 0˚ N, 90˚ E, 180˚ S, 270˚ W
    //      altitude: In radians
    //      altInDegs: Altitude in degrees. 0° horizon, +90° zenith, −90° is nadir (down).
    //      ascension: Right ascension in radians
    //      declination: Declination in radians
    //      delta: Distance between centers of the Earth and Moon, in km
    //      paralacticAngle: In radians 
    //    }

---

### Lunar Distance

    var lon = 34.05361
    var lat = -118.24550

    var dist = A.get.lunarDistance(new Date, lat, lon)

    //  Takes the following arguments:
    //      object: A Javascript date object.
    //      integer: Latitude
    //      integer: Longitude
    //      integer: Optional height above sea level, in meters
    //
    //  Returns an object with:
    //  {
    //      kilometers: Distance to the moon in kilometers
    //      miles: Distance to the moon in miles
    //  }



---


### Moon Illumination

    var lon = 34.05361
    var lat = -118.24550

    var illum = A.get.moonIllumination(new Date, lat, lon)

    //  Returns an object with:
    //  {
    //      phaseAngle: The illuminated fraction of the moon in radians
    //      illumination: The ratio of the illuminated area of the disk to the total area.
    //      phase: moon phase as a number between 0 and 1. See below.
    //  }
    //
    //      0.00 = New Moon
    //      0.125 = Waxing Crescent
    //      0.25 = First Quarter
    //      0.375 = Waxing Gibbous
    //      0.5	= Full Moon
    //      62.5 = Waning Gibbous
    //      0.75 = Last Quarter
    //      0.875 = Waning Crescent

---

### Sun Times

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
    //      rise: Sunrise time in Unix
    //      transit: The length of time the sun is above the horizon, in seconds
    //      set: Sunset time in Unix
    //  }


---

### Sun Times All

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

    var s = A.get.summerSolstice(2021)

    //  Takes one argument:
    //      Integer: The year
    //
    //  Returns a Javascript date object 

----


### Winter Solstice

    var s = A.get.winterSolstice(2021)

    //  Takes one argument:
    //      Integer: The year
    //
    //  Returns a Javascript date object 

----


### Vernal Equinox

    var s = A.get.vernalEquinox(2021)

    //  Takes one argument:
    //      Integer: The year
    //
    //  Returns a Javascript date object 

----

### Fall Equinox

    var s = A.get.fallEquinox(2021)

    //  Takes one argument:
    //      Integer: The year
    //
    //  Returns a Javascript date object 

----



