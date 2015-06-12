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

    // Algorithums -------------------------------------------------------------
    var algorithums = function _algoithums(){

        var ctx = document.createElement('canvas').getContext('2d');  // Unattached canvas element to involke createImageData
        /**
        * Return a distance of two colors ina three dimensional space
        * @param array
        * @param array
        * @return number
        * */
        var colorDistance = function(a,b) {
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
        var approximateColor = function(color, palette) {
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
            var found_color = findIndex(colorDistance,color,palette,palette[0]);
            return found_color;
        }
    
        /**
        * Threshold function
        * */
        var threshold = function(value) {
            var result = value < 127 ? 0 : 255;
            return result;            
        };
    
        
        return {
            // OrderedDither -------------------------------------------------------
            ordered: function(in_imgdata,w,h,palette, step) {
                console.log("ordered");
                // Create a new empty image
                var out_imgdata = ctx.createImageData(w,h);
                var d = new Uint8ClampedArray(in_imgdata.data);
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
            },
    
            // Atkinson ------------------------------------------------------------
            atkinson: function(in_imgdata,w,h,palette,step) {
                console.log("atkinson");
                // Create a new empty image
                var out_imgdata = ctx.createImageData(w,h);
                var d = new Uint8ClampedArray(in_imgdata.data);
                var out = new Uint8ClampedArray(in_imgdata.data);
                // Ratio >=1
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
                        var approx = approximateColor(color,palette);
                        
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
            },
    
            // Error Diffusion -----------------------------------------------------
            errorDiffusion: function(in_imgdata,w,h,palette,step) {
                console.log("errorDiffusion");
                // Create a new empty image
                var out_imgdata = ctx.createImageData(w,h);
                var d = new Uint8ClampedArray(in_imgdata.data);
                var out = new Uint8ClampedArray(in_imgdata.data);
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
                        var approx = approximateColor(color,palette);
                        
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
            },
    
        }
    }();

    
    
    
    //--------------------------------------------------------------------------
    
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
    this._dither = function(input,algorithum_name,palette,step,output) {
        var ditherCtx = this;
        palette = palette || self.opt.palette;
        step = step || self.opt.step
        algorithum_name = algorithum_name || self.opt.algorithm;
        var dither_algorithum = algorithums[algorithum_name]
        if (!dither_algorithum){
            throw new Error('Not a valid algorithm', algorithum_name, Object.keys(algorithums));
        }

        // Aquire image dimensions (regardless of input type)
        var width = input.clientWidth || input.width || input.canvas.width;
        var height = input.clientHeight || input.height || input.canvas.height;

        /**
        * Given an image element substitute it with a canvas
        * and return the context
        * @param node - the image element
        * @return context - drawing context
        * */
        this.replaceElementWithCanvasAndGetContext = function(el) {
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

            return canvas.getContext('2d');
        }

        /**
        * Given a context, canvas or image - return a Context2D
        * will return undefined if unable to aquire a context
        * @param o - canvas, context or image
        * @return context - drawing context
        * */        
        this.getContext = function(o) {
            if (!o) {return undefined;}
            var context;
            var type = o.constructor.name;
            if (type == "CanvasRenderingContext2D") {
                context = o;
            }
            else if (type == "HTMLCanvasElement") {
                context = o.getContext('2d');
            }
            else if (type == "HTMLImageElement") {
                context = this.replaceElementWithCanvasAndGetContext(o);
                context.drawImage(o,0,0,width,height);
            }
            if (!context) {return undefined;}
            context.imageSmoothingEnabled = false;
            return context;
        }
        
        
        var context_input = this.getContext(input);
        var input_image = context_input.getImageData(0,0,width,height);
        var output_image = dither_algorithum(input_image,width,height,palette,step);
        var output_context = this.getContext(output) || context_input;
        output_context.putImageData(output_image,0,0);
        
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

/**
* Export class for node 
* */
if (typeof module === "object" && module.exports) {
    module.exports = DitherJS;
}

