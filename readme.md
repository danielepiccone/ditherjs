# ditherJS

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](http://creativecommons.org/licenses/by-sa/4.0/)
[![Build Status](https://travis-ci.org/dpiccone/ditherjs.svg?branch=master)](https://travis-ci.org/dpiccone/ditherjs)
[![Coverage Status](https://coveralls.io/repos/github/dpiccone/ditherjs/badge.svg?branch=master)](https://coveralls.io/github/dpiccone/ditherjs?branch=master)

A javascript library which dithers an image using a fixed palette.

Run `npm run demo:client` or `npm run demo:sever` to see it in action.

## Installation and dependencies

```sh
$ npm install ditherjs --save
```

Both client and server are exposed as commonJS modules to be used with webpack or browserify.

The client-side version is also published with an UMD compatible wrapper and a jQuery plugin, those versions are in `./dist`

The server-side version needs [node-canvas](https://github.com/Automattic/node-canvas) installed as a peer dependency to work, this is also needed to run run the tests during development.

```sh
$ npm install ditherjs canvas --save
```

## Usage and options

Any DitherJS instance exposes a `dither(target, [options])` method which accepts a *selector* a *Node<img>* or a *buffer* as a target and an optional options object.

The options can be passed directly to the method or directly in the constructor.

```javascript
var options = {
    "step": 1, // The step for the pixel quantization n = 1,2,3...
    "palette": defaultPalette, // an array of colors as rgb arrays
    "algorithm": "ordered" // one of ["ordered", "diffusion", "atkinson"]
};
```

A default palette is provided which is CGA Palette 1

![Rick dangerhous II](http://www.rickdangerous.co.uk/cga20a.png)

The palette structure is as an array of rgb colors `[[r,g,b]..]`

### Client


```javascript
var DitherJS = require('ditherjs');

var ditherjs = new DitherJS([,options]);
ditherjs.dither(selector,[,options]); // should target <img> elements
```

as a jQuery plugin
```javascript
$('.dither').ditherJS(options);
```

or directly on the element
```html
<img src="..." onload="ditherjs.dither(this)" />
```

## Server

```javascript
var DitherJS = require('ditherjs/server');

var ditherjs = new DitherJS([,options]);

// Get a buffer that can be loaded into a canvas
var buffer = fs.readFileSync('./myBeautifulFile.jpg|gif|png');

ditherjs.dither(buffer,[,options]);
```

### Testimonials

Useful as a comb to a bald man. -Anon

author 2014 [Daniele Piccone](http://www.danielepiccone.com)
