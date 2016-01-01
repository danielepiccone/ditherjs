/**
* Javascript dithering library
* @author 2014 Daniele Piccone
* @author www.danielepiccone.com
* */

"use strict";

/**
* Process a series of img elements and make them canvas graphics
*
* @param selector - the selector of the elements to process
* @param opt - the options object
*/

var DitherJS = (function (window) {

    /**
    * Return a distance of two colors ina three dimensional space
    * @param array
    * @param array
    * @return number
    * */
    function colorDistance(a,b) {
        //if (a == null) return b;
        //if (b == null) return a;
        return Math.sqrt(
            Math.pow( ((a[0]) - (b[0])),2 )
            + Math.pow( ((a[1]) - (b[1])),2 )
            + Math.pow( ((a[2]) - (b[2])),2 )
        );
    };

    /**
    * Return the most closer color vs a common palette
    * @param array - the color
    * @return i - the index of the coloser color
    * */
    function approximateColor(color, palette) {
        var findIndex = function(fun,arg,list,min) {
            if (list.length == 2) {
                if (fun(arg,min) <= fun(arg,list[1])) {
                    return min;
                }else {
                    return list[1];
                }
            } else {
                //var hd = list[0];
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

    /* *
     * Dithering algorithms
     *
     * orderedDither
     * atkinsonDither
     * errorDiffusionDither
     * */

    function orderedDither(in_imgdata, ctx, palette, step, h, w) {
        var out_imgdata = ctx.createImageData(in_imgdata);
        var d = new Uint8ClampedArray(in_imgdata.data);
        var ratio = 3;
        var m = new Array(
            [  1,  9,  3, 11 ],
            [ 13,  5, 15,  7 ],
            [  4, 12,  2, 10 ],
            [ 16,  8, 14,  6 ]
        );

        for (var y=0;y<h;y += step) {
            for (var x=0;x<w;x += step) {
                var i = (4*x) + (4*y*w);

                // Define bytes
                var r = i;
                var g = i+1;
                var b = i+2;
                var a = i+3;

                d[r] += m[x%4][y%4] * ratio;
                d[g] += m[x%4][y%4] * ratio;
                d[b] += m[x%4][y%4] * ratio;

                //var tr = threshold(d[r]);
                //var tg = threshold(d[g]);
                //var tb = threshold(d[b]);
                var color = new Array(d[r],d[g],d[b]);
                var approx = approximateColor(color, palette);
                var tr = approx[0];
                var tg = approx[1];
                var tb = approx[2];

                // d[r] = t;
                // d[g] = t;
                // d[b] = t;

                // Draw a block
                for (var dx=0;dx<step;dx++){
                    for (var dy=0;dy<step;dy++){
                        var di = i + (4 * dx) + (4 * w * dy);

                        // Draw pixel
                        d[di] = tr;
                        d[di+1] = tg;
                        d[di+2] = tb;

                    }
                }
            }
        }
        out_imgdata.data.set(d);
        return out_imgdata;
    };

    function atkinsonDither(in_imgdata, ctx, palette, step, h, w) {
        var out_imgdata = ctx.createImageData(in_imgdata);
        var d = new Uint8ClampedArray(in_imgdata.data);
        var out = new Uint8ClampedArray(in_imgdata.data);
        var ratio = 1/8;

        for (var y=0;y<h;y += step) {
            for (var x=0;x<w;x += step) {
                var i = (4*x) + (4*y*w);

                var $i = function(x,y) {
                    return (4*x) + (4*y*w);
                };

                // Define bytes
                var r = i;
                var g = i+1;
                var b = i+2;
                var a = i+3;

                var color = new Array(d[r],d[g],d[b]);
                var approx = approximateColor(color, palette);

                var q = [];
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

                d[$i(x+step,y) + 1] += ratio * q[r];
                d[$i(x-step,y+step) + 1] += ratio * q[r];
                d[$i(x,y+step) + 1] += ratio * q[r];
                d[$i(x+step,y+step) + 1] += ratio * q[r];
                d[$i(x+(2*step),y) + 1] += ratio * q[r];
                d[$i(x,y+(2*step)) + 1] += ratio * q[r];

                d[$i(x+step,y) + 2] += ratio * q[r];
                d[$i(x-step,y+step) + 2] += ratio * q[r];
                d[$i(x,y+step) + 2] += ratio * q[r];
                d[$i(x+step,y+step) + 2] += ratio * q[r];
                d[$i(x+(2*step),y) + 2] += ratio * q[r];
                d[$i(x,y+(2*step)) + 2] += ratio * q[r];

                var tr = approx[0];
                var tg = approx[1];
                var tb = approx[2];

                // Draw a block
                for (var dx=0;dx<step;dx++){
                    for (var dy=0;dy<step;dy++){
                        var di = i + (4 * dx) + (4 * w * dy);

                        // Draw pixel
                        out[di] = tr;
                        out[di+1] = tg;
                        out[di+2] = tb;

                    }
                }
            }
        }
        out_imgdata.data.set(out);
        return out_imgdata;
    };

    function errorDiffusionDither(in_imgdata, ctx, palette, step, h, w) {
        var out_imgdata = ctx.createImageData(in_imgdata);
        var d = new Uint8ClampedArray(in_imgdata.data);
        var out = new Uint8ClampedArray(in_imgdata.data);
        var ratio = 1/16;
        var m = new Array(
            [  1,  9,  3, 11 ],
            [ 13,  5, 15,  7 ],
            [  4, 12,  2, 10 ],
            [ 16,  8, 14,  6 ]
        );

        for (var y=0;y<h;y += step) {
            for (var x=0;x<w;x += step) {
                var i = (4*x) + (4*y*w);

                var $i = function(x,y) {
                    return (4*x) + (4*y*w);
                };

                // Define bytes
                var r = i;
                var g = i+1;
                var b = i+2;
                var a = i+3;

                var color = new Array(d[r],d[g],d[b]);
                var approx = approximateColor(color, palette);

                var q = [];
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
                var tr = approx[0];
                var tg = approx[1];
                var tb = approx[2];

                // Draw a block
                for (var dx=0;dx<step;dx++){
                    for (var dy=0;dy<step;dy++){
                        var di = i + (4 * dx) + (4 * w * dy);

                        // Draw pixel
                        out[di] = tr;
                        out[di+1] = tg;
                        out[di+2] = tb;

                    }
                }
            }
        }
        out_imgdata.data.set(out);
        return out_imgdata;
    };

    var DitherJS = function DitherJS (selector, opt) {
        var self = this;

        // Default
        self.opt = opt || {};
        self.opt.step = self.opt.step || 1; // works better with 1,3,5,7
        self.opt.className = self.opt.className || 'dither';
        self.opt.algorithm = self.opt.algorithm || 'ordered';
        self.opt.palette = self.opt.palette || [
            [0,0,0],
            [255,0,255],
            [0,255,255],
            [255,255,255]
        ];

        /**
        * Reload src image and put draw into it
        * */
        this._refreshDither = function(el) {
            // Reload src
            el.src = el.src + '?' + Math.random();
            el.onload = function() {
                var start_time = Date.now();
                self._dither(el);
                console.log('Microtime: ', Date.now()-start_time );
            }
        };

        /**
        * This does all the dirty things
        * */
        this._dither = function(el) {
            var ditherCtx = this;

            // Take image size
            var h = el.clientHeight;
            var w = el.clientWidth;


            /**
            * Threshold function
            * */
            var threshold = function(value) {
                var result = value < 127 ? 0 : 255;
                return result;
            };

            /**
            * Given an image element substitute it with a canvas
            * and return the context
            * @param node - the image element
            * @return context - drawing context
            * */
            this.getContext = function(el) {
                var canvas = document.createElement('canvas');
                // this can influence the quality of the acquistion
                canvas.height = el.clientHeight;
                canvas.width = el.clientWidth;
                el.parentNode.replaceChild(canvas,el);

                // Inherit classes
                canvas.className = el.className;
                canvas.className = canvas.className.replace(self.opt.className,' ');
                // Inherit Styles

                // Turn it off
                // canvas.style.visibility = "hidden";

                // Get the context
                var ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;
                return ctx;
            }


            var ctx = this.getContext(el);

            // Put the picture in
            ctx.drawImage(el,0,0,w,h);

            // Pick image data
            var in_image = ctx.getImageData(0,0,w,h);

            if (self.opt.algorithm == 'errorDiffusion')
                var out_image = errorDiffusionDither(in_image, ctx, self.opt.palette, self.opt.step, h, w);
            else if (self.opt.algorithm == 'ordered')
                var out_image = orderedDither(in_image, ctx, self.opt.palette, self.opt.step, h, w);
            else if (self.opt.algorithm == 'atkinson')
                var out_image = atkinsonDither(in_image, ctx, self.opt.palette, self.opt.step, h, w);
            else
                throw new Error('Not a valid algorithm');

            // Put image data
            ctx.putImageData(out_image,0,0);

            // Turn it on
            //canvas.style.visibility = "visible";
        }


        /**
        * Main
        * */
        try {
            var elements = document.querySelectorAll(selector);

            //  deal with multiple
            for (var i=0;i<elements.length;i++) {
                this._refreshDither(elements[i]);
            }

        } catch (e) {
            // Officially not in the browser
        }

    };

    DitherJS.orderedDither = orderedDither;
    DitherJS.atkinsonDither = atkinsonDither;
    DitherJS.errorDiffusionDither = errorDiffusionDither;

    return DitherJS;

})(window);

/**
* Register AMD module
* */
if (typeof define === 'function' && define.amd) {
    define('ditherjs', function(){
        return DitherJS;
    });
};

/**
* Export class for node
* */
if (typeof module === "object" && module.exports) {
    module.exports = DitherJS;
}

;/**
* jQuery plugin definition
* */
;(function( $ ) {
    $.fn.ditherJS = function(opt) {
            new DitherJS(this.selector,opt);            
        return this;
    };
}( jQuery ));
