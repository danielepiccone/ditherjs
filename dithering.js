/**
 * Javascript dithering library
 * 2014 www.danielepiccone.com
 * */

"use strict";

var deb = {};

var Dithering = function Dithering(selector) {
    
    this._dither = function(el) {
        // Take image size
        var h = el.clientHeight;
        var w = el.clientWidth;

        // Render a canvas
        // var putCanvas = function(el) {
        //     var canvas = document.createElement('canvas');
        //     // this can influence the quality of the acquistion
        //     canvas.height = h;
        //     canvas.width = w;
        //     el.parentNode.appendChild(canvas);
        //     return canvas;    
        // }

        // Render a canvas
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

        // Get the context
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        deb.ctx = ctx;    

        // Put the picture in
        ctx.drawImage(el,0,0,w,h);

        // Pick image data
        var in_image = ctx.getImageData(0,0,w,h);
        deb.in = in_image;

        // Manipulate the array
        var processData = function(in_imgdata) {

            var threshold = function(value) {
                var result = value < 127 ? 0 : 255;
                return result;            
            };

            // Create a new empty image
            var out_imgdata = ctx.createImageData(in_imgdata);
            var d = new Uint8ClampedArray(in_imgdata.data);

            var step = 1;
            for (var i=0;i<d.length;i += step*4) {
                // Define bytes
                var r = i;
                var g = i+1;
                var b = i+2;
                var a = i+3;

                var t = threshold(d[r]);
                d[r] = t;
                d[g] = t;
                d[b] = t;

            }
            out_imgdata.data.set(d);
            return out_imgdata;
        };
        var out_image = processData(in_image);
        // Put image data
        ctx.putImageData(out_image,0,0);
    }

    /**
    * Set the visibility to true to all the dithered items
    * */
    this.turnOn = function() {
        //
    }

    var elements = document.querySelectorAll(selector);
    // TODO deal with multiple
    
    for (var i=0;i<elements.length;i++) {
        this._dither(elements[i]);
    }

};

