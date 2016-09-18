// TODO
// jquery wrapper

/**
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

        this.opt.palette = this.opt.palette || require('./utils.client.js').defaultPalette;

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

    DitherJS.orderedDither = require('./orderedDither.js');
    DitherJS.atkinsonDither = require('./atkinsonDither.js');
    DitherJS.errorDiffusionDither = require('./errorDiffusionDither.js');

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
if (typeof define === 'function' && define.amd) {
    define('ditherjs', function(){
        return DitherJS;
    });
}

/**
* Export class for node
* */
if (typeof module === "object" && module.exports) {
    module.exports = DitherJS;
}

window.DitherJS = DitherJS;
