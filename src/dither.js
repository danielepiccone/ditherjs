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

var Dithering = function Dithering(selector,opt) {
    var self = this;

    // Default
    self.opt = opt || {};
    self.opt.step = self.opt.step || 1; // works better with 1,3,5,7
    self.opt.className = self.opt.className || 'dither';
    self.opt.palette = self.opt.palette || [
        [0,0,0],
        [255,0,255],
        [0,255,255],
        [255,255,255]
    ];

    this.palette = self.opt.palette;

    // Reload the src and process
    this._refreshDither = function(el) {
        // Reload src
        el.src = el.src + '?' + Math.random();
        el.onload = function() { 
            self._dither(el);
        }
    };

    /**
    * This does all the dirty things
    * */
    this._dither = function(el) {
        var start_time = Date.now();

        el.crossOrigin = 'http://profile.ak.fbcdn.net/crossdomain.xml';

        // Take image size
        var h = el.clientHeight;
        var w = el.clientWidth;

        // Render a canvas and replace 
        var replaceImgWithCanvas = function(el) {
            var canvas = document.createElement('canvas');
            // this can influence the quality of the acquistion
            canvas.height = h;
            canvas.width = w;
            el.parentNode.replaceChild(canvas,el);
            return canvas;    
        }

        //var canvas = putCanvas();
        var canvas = replaceImgWithCanvas(el);

        // Inherit classes
        canvas.className = el.className;
        canvas.className = canvas.className.replace(self.opt.className,' ');
        // Inherit Styles

        // Turn it off
        // canvas.style.visibility = "hidden";

        // Get the context
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        // Put the picture in
        ctx.drawImage(el,0,0,w,h);

        // Pick image data
        var in_image = ctx.getImageData(0,0,w,h);

        // Manipulate the array
        var processData = function(in_imgdata) {

            // Create a new empty image
            var out_imgdata = ctx.createImageData(in_imgdata);
            var d = new Uint8ClampedArray(in_imgdata.data);

            // Step
            var step = self.opt.step;

            // Ratio >=1
            var ratio = 5;

            // Threshold Matrix
            var m = new Array(
                [  1,  9,  3, 11 ],
                [ 13,  5, 15,  7 ],
                [  4, 12,  2, 10 ],
                [ 16,  8, 14,  6 ]
            );

            /**
            * Threshold function
            * */
            var threshold = function(value) {
                var result = value < 127 ? 0 : 255;
                return result;            
            };

            /**
            * Return the most closer color
            * */
            var approximateColor = function(color) {
                var palette = self.opt.palette;

                var colorDistance = function(a,b) {
                    //if (a == null) return b;
                    //if (b == null) return a;
                    return Math.sqrt( 
                        Math.pow( ((a[0]) - (b[0])),2 )
                        + Math.pow( ((a[1]) - (b[1])),2 ) 
                        + Math.pow( ((a[2]) - (b[2])),2 )
                    );
                };

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
                var i = findIndex(colorDistance,color,palette,palette[0]);
                return i;
            }

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
                    var approx = approximateColor(color);
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


        var out_image = processData(in_image);

        // Put image data
        ctx.putImageData(out_image,0,0);
        
        // Turn it on
        //canvas.style.visibility = "visible";

        console.log('Microtime: ', Date.now()-start_time );
    }

    /**
    * Set the visibility to true to all the dithered items
    * */
    this.turnOn = function() {
        //
    }

    var elements = document.querySelectorAll(selector);
    
    //  deal with multiple
    for (var i=0;i<elements.length;i++) {
        this._refreshDither(elements[i]);
    }

};


