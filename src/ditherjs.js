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

var DitherJS = function DitherJS(selector,opt) {
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

    this.palette = self.opt.palette;

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

        //el.crossOrigin = 'http://profile.ak.fbcdn.net/crossdomain.xml';

        // Take image size
        var h = el.clientHeight;
        var w = el.clientWidth;

        /**
        * Return a distance of two colors ina three dimensional space
        * @param array
        * @param array
        * @return number
        * */
        this.colorDistance = function(a,b) {
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
        this.approximateColor = function(color) {
            var palette = self.opt.palette;
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
            var found_color = findIndex(ditherCtx.colorDistance,color,palette,palette[0]);
            return found_color;
        }

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

        /**
        * Perform an ordered dither on the image
        * */
        this.orderedDither = function(in_imgdata) {
            // Create a new empty image
            var out_imgdata = ctx.createImageData(in_imgdata);
            var d = new Uint8ClampedArray(in_imgdata.data);
            // Step
            var step = self.opt.step;
            // Ratio >=1
            var ratio = 3;
            // Threshold Matrix
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
                    var approx = ditherCtx.approximateColor(color);
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

        /**
        * Perform an error diffusion dither on the image
        * */
        this.errorDiffusionDither = function(in_imgdata) {
            // Create a new empty image
            var out_imgdata = ctx.createImageData(in_imgdata);
            var d = new Uint8ClampedArray(in_imgdata.data);
            var out = new Uint8ClampedArray(in_imgdata.data);
            // Step
            var step = self.opt.step;
            // Ratio >=1
            var ratio = 1/16;
            // Threshold Matrix
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
                    var approx = ditherCtx.approximateColor(color);
                    
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

        var ctx = this.getContext(el);

        // Put the picture in
        ctx.drawImage(el,0,0,w,h);

        // Pick image data
        var in_image = ctx.getImageData(0,0,w,h);

        //var out_image = ditherCtx.orderedDither(in_image);
        if (self.opt.algorithm == 'errorDiffusion')
            var out_image = ditherCtx.errorDiffusionDither(in_image);
        else if (self.opt.algorithm == 'ordered')
            var out_image = ditherCtx.orderedDither(in_image);
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
    var elements = document.querySelectorAll(selector);

    //  deal with multiple
    for (var i=0;i<elements.length;i++) {
        this._refreshDither(elements[i]);
    }

};

/**
 * Register AMD module
 * */
if (typeof define === 'function' && define.amd) {
    define('ditherjs', function(){
        // This function is expected to instantiate the module
        // in this case returns the constructor
        return DitherJS;
    });
};

