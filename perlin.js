; /* Fast 2D Perlin Noise */ ;
; /* Taken from http://freespace.virgin.net/hugo.elias/models/m_perlin.htm */ ;
; /* This file is public domain.  Other files are not. */ ;

namespace = window.namespace || {};
namespace.util = namespace.util || {};

namespace.util.perlin = (function() {
   function _cosineInterpolate(a, b, x) {
	var ft = x * Math.PI;
	var f = (1 - Math.cos(ft)) * .5;
	return  a*(1-f) + b*f;
   }
  
  function _perlinNoise(x) {
    x = (x<<13) ^ x;
    return ( 1.0 - ( (x * (x * x * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
  }

  function _smoothPerlinNoise(x) {
    return _perlinNoise(x)/2  +  _perlinNoise(x-1)/4  +  _perlinNoise(x+1)/4;
  }


  function _interpolatedPerlinNoise(x) {
      var integer_X    = Math.floor(x);
      var fractional_X = x - integer_X;

      var v1 = _smoothPerlinNoise(integer_X);
      var v2 = _smoothPerlinNoise(integer_X + 1);

      return _cosineInterpolate(v1 , v2 , fractional_X);
  }

  return function perlin(x) {
      var total = 0;
      var p = 0.25; // persistence
      var n = 7; // octaves - 1

      for (var i = 0; i < n; i++) {
          var frequency = Math.pow(2, i);
          var amplitude = Math.pow(p, i);

          total = total + _interpolatedPerlinNoise(x * frequency) * amplitude;
      }


      return total;
  }
})();

namespace.util.perlin2d = (function() {
    
  function _cosineInterpolate(a, b, x) {
	var ft = x * Math.PI;
	var f = (1 - Math.cos(ft)) * .5;
	return  a*(1-f) + b*f;
   }
    
  function _perlinNoise(x, y) {
    var n = x + y * 57;
    n = (n<<13) ^ n;
    return ( 1.0 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
  }

  function _smoothPerlinNoise(x, y) {
    var corners = ( _perlinNoise(x-1, y-1)+_perlinNoise(x+1, y-1)+_perlinNoise(x-1, y+1)+_perlinNoise(x+1, y+1) ) / 16;
    var sides   = ( _perlinNoise(x-1, y)  +_perlinNoise(x+1, y)  +_perlinNoise(x, y-1)  +_perlinNoise(x, y+1) ) /  8;
    var center  =  _perlinNoise(x, y) / 4;
    return corners + sides + center;
  }

  function _interpolatedPerlinNoise(x, y) {
      var integer_X    = Math.floor(x);
      var fractional_X = x - integer_X;

      var integer_Y    = Math.floor(y);
      var fractional_Y = y - integer_Y;

      var v1 = _smoothPerlinNoise(integer_X,     integer_Y);
      var v2 = _smoothPerlinNoise(integer_X + 1, integer_Y);
      var v3 = _smoothPerlinNoise(integer_X,     integer_Y + 1);
      var v4 = _smoothPerlinNoise(integer_X + 1, integer_Y + 1);

      var i1 = _cosineInterpolate(v1 , v2 , fractional_X);
      var i2 = _cosineInterpolate(v3 , v4 , fractional_X);

      return _cosineInterpolate(i1 , i2 , fractional_Y);
  }


  return function perlin2d(x, y) {
      var total = 0;
      var p = 0.25;  // Persistence
      var n = 7;

      for (var i = 0; i < n; i++) {
          var frequency = Math.pow(2, i);
          var amplitude = Math.pow(p, i);
          total = total + _interpolatedPerlinNoise(x * frequency, y * frequency) * amplitude;
      }

      return total;
  } 
})();