#ditherJS

A javascript library which transforms an <img> element
into a dithered image using a fixed palette.

###Usage:
HTML:
```
<img src="..." class="dither" />
```

JS:
```
new DitherJS('.dither'[,options]);
```
or as a jQuery plugin
```
$('.dither').ditherJS(options);
```

options are defined as:
```
var options = {
    "step": n // The step for the pixel quantization n = 1,2,3...
    "palette": palette // an array of colors as rgb arrays
    "className": "dither" // can be whatever class used in the constructor
    "algorithm": "ordered" // can be "ordered" or "errorDiffusion"
};
```

the monochrome branch supports also
```"monochrome": true```

check the /demo for more informations.

### Testimonials

Useful as a comb to a bald man. -Anon

### Changelog

- <video> rendering, courtesy of [@calaldees](https://github.com/calaldees)
- jquery plugin wrapper

author 2014 [Daniele Piccone](http://www.danielepiccone.com)

license [GPL](https://gnu.org/licenses/gpl.html)
