/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	* Javascript dithering library
	* @author 2014 Daniele Piccone
	* @author www.danielepiccone.com
	* */

	var DitherJS = (function (window) {

	    'use strict';

	    var DitherJS = function DitherJS (selector, opt) {

	        // Default
	        this.opt = opt || {};
	        this.opt.step = this.opt.step || 1; // works better with 1,3,5,7
	        this.opt.className = this.opt.className || 'dither';
	        this.opt.algorithm = this.opt.algorithm || 'ordered';

	        if (
	            !this.opt.algorithm ||
	            !['ordered', 'atkinson', 'diffusion'].includes(this.opt.algorithm)
	        ) {
	            throw new Error('InvalidAlgorithm');
	        }

	        this.opt.palette = this.opt.palette || __webpack_require__(1).defaultPalette;

	        try {
	            var elements = window.document.querySelectorAll(selector);

	            for (var i=0;i<elements.length;i++) {
	                this._refreshAndDither(elements[i]);
	            }

	        } catch (e) {
	            console.error(e);
	            throw e;
	        }

	    };

	    DitherJS.orderedDither = __webpack_require__(2);
	    DitherJS.atkinsonDither = __webpack_require__(3);
	    DitherJS.errorDiffusionDither = __webpack_require__(4);

	    DitherJS.prototype._replaceElementWithContext = function(el) {
	        var canvas = window.document.createElement('canvas');

	        canvas.height = el.clientHeight;
	        canvas.width = el.clientWidth;

	        el.parentNode.replaceChild(canvas,el);

	        canvas.className = el.className;
	        canvas.className = canvas.className.replace(this.opt.className,' ');

	        var ctx = canvas.getContext('2d');
	        ctx.imageSmoothingEnabled = false;

	        return ctx;
	    };

	    DitherJS.prototype._ditherImgElement = function(el) {
	        var ditherCtx = this;

	        var h = el.clientHeight;
	        var w = el.clientWidth;

	        var ctx = this._replaceElementWithContext(el);

	        ctx.drawImage(el,0,0,w,h);

	        var inputImage = ctx.getImageData(0,0,w,h);

	        var out;
	        if (this.opt.algorithm == 'diffusion')
	            out = DitherJS.errorDiffusionDither(inputImage.data, this.opt.palette, this.opt.step, h, w);
	        else if (this.opt.algorithm == 'ordered')
	            out = DitherJS.orderedDither(inputImage.data, this.opt.palette, this.opt.step, h, w);
	        else if (this.opt.algorithm == 'atkinson')
	            out = DitherJS.atkinsonDither(inputImage.data, this.opt.palette, this.opt.step, h, w);
	        else
	            throw new Error('Not a valid algorithm');

	        var outputImageData = ctx.createImageData(inputImage);
	        outputImageData.data.set(out);
	        ctx.putImageData(outputImageData,0,0);
	    };

	    DitherJS.prototype._refreshAndDither = function(el) {
	        var self = this;
	        el.src = el.src + '?' + Math.random();
	        el.onload = function() {
	            var start_time = Date.now();
	            self._ditherImgElement(el);
	            console.log('Microtime: ', Date.now()-start_time );
	        };
	    };

	    return DitherJS;

	})(window);

	/**
	* Register AMD module
	* */
	if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function(){
	        return DitherJS;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

	/**
	* Export class for node
	* */
	if (typeof module === "object" && module.exports) {
	    module.exports = DitherJS;
	}

	window.DitherJS = DitherJS;


/***/ },
/* 1 */
/***/ function(module, exports) {

	function colorDistance(a,b) {
	    return Math.sqrt(
	        Math.pow( ((a[0]) - (b[0])),2 ) +
	            Math.pow( ((a[1]) - (b[1])),2 ) +
	            Math.pow( ((a[2]) - (b[2])),2 )
	    );
	}

	function approximateColor(color, palette) {
	    var findIndex = function(fun, arg, list, min) {
	        if (list.length == 2) {
	            if (fun(arg,min) <= fun(arg,list[1])) {
	                return min;
	            }else {
	                return list[1];
	            }
	        } else {
	            var tl = list.slice(1);
	            if (fun(arg,min) <= fun(arg,list[1])) {
	                min = min;
	            } else {
	                min = list[1];
	            }
	            return findIndex(fun,arg,tl,min);
	        }
	    };
	    var found_color = findIndex(colorDistance, color, palette, palette[0]);
	    return found_color;
	}

	module.exports = {
	    approximateColor: approximateColor,
	    colorDistance: colorDistance,
	    defaultPalette: [
	        [0, 0, 0],
	        [255, 0, 255],
	        [0, 255, 255],
	        [255, 255, 255]
	    ]
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(1);

	var approximateColor = utils.approximateColor;

	function orderedDither(uint8data, palette, step, h, w) {
	    var d = new Uint8ClampedArray(uint8data);
	    var ratio = 3;
	    var m = new Array(
	        [  1,  9,  3, 11 ],
	        [ 13,  5, 15,  7 ],
	        [  4, 12,  2, 10 ],
	        [ 16,  8, 14,  6 ]
	    );

	    var r, g, b, a, q, i, color, approx, tr, tg, tb, dx, dy, di;

	    for (var y=0;y<h;y += step) {
	        for (var x=0;x<w;x += step) {
	            i = (4*x) + (4*y*w);

	            // Define bytes
	            r = i;
	            g = i+1;
	            b = i+2;
	            a = i+3;

	            d[r] += m[x%4][y%4] * ratio;
	            d[g] += m[x%4][y%4] * ratio;
	            d[b] += m[x%4][y%4] * ratio;

	            //var tr = threshold(d[r]);
	            //var tg = threshold(d[g]);
	            //var tb = threshold(d[b]);
	            color = new Array(d[r],d[g],d[b]);
	            approx = approximateColor(color, palette);
	            tr = approx[0];
	            tg = approx[1];
	            tb = approx[2];

	            // d[r] = t;
	            // d[g] = t;
	            // d[b] = t;

	            // Draw a block
	            for (dx=0;dx<step;dx++){
	                for (dy=0;dy<step;dy++){
	                    di = i + (4 * dx) + (4 * w * dy);

	                    // Draw pixel
	                    d[di] = tr;
	                    d[di+1] = tg;
	                    d[di+2] = tb;

	                }
	            }
	        }
	    }
	    return d;
	}

	module.exports = orderedDither;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(1);

	var approximateColor = utils.approximateColor;

	function atkinsonDither(uint8data, ctx, palette, step, h, w) {
	    var d = new Uint8ClampedArray(uint8data);
	    var out = new Uint8ClampedArray(uint8data);
	    var ratio = 1/8;

	    var $i = function(x,y) {
	        return (4*x) + (4*y*w);
	    };

	    var r, g, b, a, q, i, color, approx, tr, tg, tb, dx, dy, di;

	    for (var y=0;y<h;y += step) {
	        for (var x=0;x<w;x += step) {
	            i = (4*x) + (4*y*w);

	            // Define bytes
	            r = i;
	            g = i+1;
	            b = i+2;
	            a = i+3;

	            color = new Array(d[r],d[g],d[b]);
	            approx = approximateColor(color, palette);

	            q = [];
	            q[r] = d[r] - approx[0];
	            q[g] = d[g] - approx[1];
	            q[b] = d[b] - approx[2];

	            // Diffuse the error for three colors
	            d[$i(x+step,y) + 0] += ratio * q[r];
	            d[$i(x-step,y+step) + 0] += ratio * q[r];
	            d[$i(x,y+step) + 0] += ratio * q[r];
	            d[$i(x+step,y+step) + 0] += ratio * q[r];
	            d[$i(x+(2*step),y) + 0] += ratio * q[r];
	            d[$i(x,y+(2*step)) + 0] += ratio * q[r];

	            d[$i(x+step,y) + 1] += ratio * q[g];
	            d[$i(x-step,y+step) + 1] += ratio * q[g];
	            d[$i(x,y+step) + 1] += ratio * q[g];
	            d[$i(x+step,y+step) + 1] += ratio * q[g];
	            d[$i(x+(2*step),y) + 1] += ratio * q[g];
	            d[$i(x,y+(2*step)) + 1] += ratio * q[g];

	            d[$i(x+step,y) + 2] += ratio * q[b];
	            d[$i(x-step,y+step) + 2] += ratio * q[b];
	            d[$i(x,y+step) + 2] += ratio * q[b];
	            d[$i(x+step,y+step) + 2] += ratio * q[b];
	            d[$i(x+(2*step),y) + 2] += ratio * q[b];
	            d[$i(x,y+(2*step)) + 2] += ratio * q[b];

	            tr = approx[0];
	            tg = approx[1];
	            tb = approx[2];

	            // Draw a block
	            for (dx=0;dx<step;dx++){
	                for (dy=0;dy<step;dy++){
	                    di = i + (4 * dx) + (4 * w * dy);

	                    // Draw pixel
	                    out[di] = tr;
	                    out[di+1] = tg;
	                    out[di+2] = tb;

	                }
	            }
	        }
	    }
	    return out;
	}

	module.exports = atkinsonDither;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(1);

	var approximateColor = utils.approximateColor;

	function errorDiffusionDither(uint8data, ctx, palette, step, h, w) {
	    var d = new Uint8ClampedArray(uint8data);
	    var out = new Uint8ClampedArray(uint8data);
	    var ratio = 1/16;
	    var m = new Array(
	        [  1,  9,  3, 11 ],
	        [ 13,  5, 15,  7 ],
	        [  4, 12,  2, 10 ],
	        [ 16,  8, 14,  6 ]
	    );

	    var $i = function(x,y) {
	        return (4*x) + (4*y*w);
	    };

	    var r, g, b, a, q, i, color, approx, tr, tg, tb, dx, dy, di;

	    for (y=0;y<h;y += step) {
	        for (x=0;x<w;x += step) {
	            i = (4*x) + (4*y*w);

	            // Define bytes
	            r = i;
	            g = i+1;
	            b = i+2;
	            a = i+3;

	            color = new Array(d[r],d[g],d[b]);
	            approx = approximateColor(color, palette);

	            q = [];
	            q[r] = d[r] - approx[0];
	            q[g] = d[g] - approx[1];
	            q[b] = d[b] - approx[2];

	            // Diffuse the error
	            d[$i(x+step,y)] =  d[$i(x+step,y)] + 7 * ratio * q[r];
	            d[$i(x-step,y+1)] =  d[$i(x-1,y+step)] + 3 * ratio * q[r];
	            d[$i(x,y+step)] =  d[$i(x,y+step)] + 5 * ratio * q[r];
	            d[$i(x+step,y+step)] =  d[$i(x+1,y+step)] + 1 * ratio * q[r];

	            d[$i(x+step,y)+1] =  d[$i(x+step,y)+1] + 7 * ratio * q[g];
	            d[$i(x-step,y+step)+1] =  d[$i(x-step,y+step)+1] + 3 * ratio * q[g];
	            d[$i(x,y+step)+1] =  d[$i(x,y+step)+1] + 5 * ratio * q[g];
	            d[$i(x+step,y+step)+1] =  d[$i(x+step,y+step)+1] + 1 * ratio * q[g];

	            d[$i(x+step,y)+2] =  d[$i(x+step,y)+2] + 7 * ratio * q[b];
	            d[$i(x-step,y+step)+2] =  d[$i(x-step,y+step)+2] + 3 * ratio * q[b];
	            d[$i(x,y+step)+2] =  d[$i(x,y+step)+2] + 5 * ratio * q[b];
	            d[$i(x+step,y+step)+2] =  d[$i(x+step,y+step)+2] + 1 * ratio * q[b];

	            // Color
	            tr = approx[0];
	            tg = approx[1];
	            tb = approx[2];

	            // Draw a block
	            for (dx=0;dx<step;dx++){
	                for (dy=0;dy<step;dy++){
	                    di = i + (4 * dx) + (4 * w * dy);

	                    // Draw pixel
	                    out[di] = tr;
	                    out[di+1] = tg;
	                    out[di+2] = tb;

	                }
	            }
	        }
	    }
	    return out;
	}

	module.exports = errorDiffusionDither;



/***/ }
/******/ ]);