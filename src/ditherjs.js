/**
* Javascript dithering library
* @author 2014 Daniele Piccone 
* @author www.danielepiccone.com
* */

"use strict";


var DitherJSInternals = {
    palettes: {
        DOS_CGA: [
            [  0,   0,   0],  // black
            [255,   0, 255],  // magenta
            [  0, 255, 255],  // cyan
            [255, 255, 255]   // white
        ],
        DOS_EGA: [
            [  0,   0,   0],  //  0 - black (#000000)
            [  0,   0, 170],  //  1 - blue (#0000AA)
            [  0, 170,   0],  //  2 - green (#00AA00)
            [  0, 170, 170],  //  3 - cyan (#00AAAA)
            [170,   0,   0],  //  4 - red (#AA0000)
            [170,   0, 170],  //  5 - magenta (#AA00AA)
            [170,  85,   0],  //  6 - brown (#AA5500)
            [170, 170, 170],  //  7 - white / light gray (#AAAAAA)
            [ 85,  85,  85],  //  8 - dark gray / bright black (#555555)
            [ 85,  85, 255],  //  9 - bright blue (#5555FF)
            [ 85, 255,  85],  // 10 - bright green (#55FF55)
            [ 85, 255, 255],  // 11 - bright cyan (#55FFFF)
            [ 85,  85,  85],  // 12 - bright red (#FF5555)
            [255,  85, 255],  // 13 - bright magenta (#FF55FF)
            [255, 255,  85],  // 14 - bright yellow (#FFFF55)
            [255, 255, 255]   // 15 - bright white (#FFFFFF)
        ],
        APPLE2: [
            [  0,   0,   0],  //  0 - black (#000000)
            [114,  38,  64],  //  1 - magenta (#722640)
            [ 64,  51, 127],  //  2 - dark blue (#40337f)
            [228,  52, 254],  //  3 - purple (#e434fe)
            [ 14,  89,  64],  //  4 - dark green (#0e5940)
            [127, 127, 127],  //  5 - grey1 (#7f7f7f)
            [ 27, 154, 254],  //  6 - medium blue (#1b9afe)
            [191, 179, 255],  //  7 - light blue (#bfb3ff)
            [ 64,  76,   0],  //  8 - brown (#404c00)
            [228, 101,   1],  //  9 - orange (#e46501)
            //[  0,   0,    0],  // 10 - grey2 (#7f7f7f) // DUplicate in palette
            [241, 166, 191],  // 11 - pink (#f1a6bf)
            [ 27, 203,   1],  // 12 - green (#1bcb01)
            [191, 204, 128],  // 13 - yellow (#bfcc80)
            [141, 217, 191],  // 14 - aqua (#8dd9bf)
            [255, 255, 255]  // 15 - white (#ffffff)
        ],
        C64: [
            [  0,   0,   0],  //  0 - black (#000000)
            [255, 255, 255],  //  1 - white (#ffffff)
            [136,  57,  50],  //  2 - red (#883932)
            [103, 182, 189],  //  3 - cyan (#67b6bd)
            [139,  63, 150],  //  4 - purple (#8b3f96)
            [ 85, 160,  73],  //  5 - green (#55a049)
            [ 64,  49, 141],  //  6 - blue (#40318d)
            [191, 206, 114],  //  7 - yellow (#bfce72)
            [139,  84,  41],  //  8 - orange (#8b5429)
            [ 87,  66,   1],  //  9 - brown (#574200)
            [184, 105,  98],  // 10 - light red (#b86962)
            [ 80,  80,  80],  // 11 - dark grey (#505050)
            [120, 120, 120],  // 12 - grey (#787878)
            [148, 224, 137],  // 13 - light green (#94e089)
            [120, 105, 196],  // 14 - light blue (#7869c4)
            [159, 159, 159]   // 15 - light grey (#9f9f9f)
        ]
    },
    
    algorithums: function _algoithums(){

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
        
        return {
            // OrderedDither -------------------------------------------------------
            ordered: function(in_imgdata,w,h,palette, step) {
                //console.log("ordered");
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
                //console.log("atkinson");
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
                //console.log("errorDiffusion");
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
    }(),

    
    dither: function(input,algorithum_name,palette,step,output) {
        var dither_algorithum = this.algorithums[algorithum_name];
        if (!dither_algorithum){
            throw new Error('Not a valid algorithm', algorithum_name, Object.keys(algorithums));
        }

        // Aquire image dimensions (regardless of input type)
        var width = input.clientWidth || input.width || input.canvas.width;
        var height = input.clientHeight || input.height || input.canvas.height;

        /**
        * Given a context, canvas or image - return a Context2D
        * will return undefined if unable to aquire a context
        * @param o - canvas, context or image
        * @return context - drawing context
        * */        
        this.getContext = function(o) {
            if (!o) {return undefined;}
            var context;
            var type = o.constructor.name;  // It should be safe to use constructor.name as these are refering to System level objects.
            if (type == "CanvasRenderingContext2D") {
                context = o;
            }
            else if (type == "HTMLCanvasElement") {
                context = o.getContext('2d');
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
    }
};

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
    self.opt.palette = self.opt.palette || DitherJSInternals.palettes.DOS_CGA;

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
        palette = palette || self.opt.palette;
        step = step || self.opt.step
        algorithum_name = algorithum_name || self.opt.algorithm;

        // Replace ImageElement with Canvas
        if (input.constructor.name == "HTMLImageElement") {
            var canvas = document.createElement('canvas');
            canvas.height = input.clientHeight;
            canvas.width = input.clientWidth;
            input.parentNode.replaceChild(canvas,input);
            canvas.className = input.className.replace(self.opt.className,' ');
            var context = canvas.getContext('2d');
            context.drawImage(input,0,0,canvas.width,canvas.height);
            input = context;
        }

        DitherJSInternals.dither(input, algorithum_name, palette, step, output);
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
    define('ditherjs', [], function(){
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

