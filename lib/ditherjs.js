/**
* Javascript dithering library
* @author 2014 Daniele Piccone
* @author www.danielepiccone.com
* */

var utils = require('./utils.js');

var DitherJS = function DitherJS (options) {

    this.options = options || {};
    this.options.algorithm = this.options.algorithm || 'ordered';
    this.options.step = this.options.step || 1;
    this.options.className = this.options.className || 'dither';
    this.options.palette = this.options.palette || utils.defaultPalette;

};

DitherJS.orderedDither = require('./algorithms/orderedDither.js');
DitherJS.atkinsonDither = require('./algorithms/atkinsonDither.js');
DitherJS.errorDiffusionDither = require('./algorithms/errorDiffusionDither.js');

DitherJS.prototype.ditherImageData = function ditherImageData(imageData, options) {
    options = options || this.options;

    var ditherFn;
    if (options.algorithm == 'diffusion')
        ditherFn = DitherJS.errorDiffusionDither;
    else if (options.algorithm == 'ordered')
        ditherFn = DitherJS.orderedDither;
    else if (options.algorithm == 'atkinson')
        ditherFn = DitherJS.atkinsonDither;
    else
        throw utils.errors.InvalidAlgorithm;

    var startTime;
    if (options.debug) {
        startTime = Date.now();
    }

    var output = ditherFn.call(
        this,
        imageData.data,
        options.palette,
        options.step,
        imageData.height,
        imageData.width
    );

    if (options.debug) {
        console.log('Microtime: ', Date.now() - startTime);
    }

    imageData.data.set(output);
};

DitherJS.prototype.colorDistance = function colorDistance(a, b) {
    return Math.sqrt(
        Math.pow( ((a[0]) - (b[0])),2 ) +
        Math.pow( ((a[1]) - (b[1])),2 ) +
        Math.pow( ((a[2]) - (b[2])),2 )
    );
};

DitherJS.prototype.approximateColor = function approximateColor(color, palette) {
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
    var foundColor = findIndex(this.colorDistance, color, palette, palette[0]);
    return foundColor;
};

module.exports = DitherJS;
