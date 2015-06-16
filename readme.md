#ditherJS

A javascript library which transforms an `<img>` element 
into a dithered image using a fixed palette.

Can also be used in conjunction with the `<video>` element to dither video in realtime. [Webcam Demo](demos/WebcamDither.html "Webcam Dithering")

The demos cannot be run directly from the local filesystem. An simple example of serving the demos locally.

    python -m SimpleHTTPServer 8080
    python -m webbrowser -t "http://localhost:8080/demo/"
    python -m webbrowser -t "http://localhost:8080/demo/WebcamDither.html"


###Usage:
HTML:

    <img src="..." class="dither" />

JS:

    new DitherJS('.dither'[,options]);

or as a jQuery plugin

    $('.dither').ditherJS(options);


Options are defined as:

    var options = {
        "step": n // The step for the pixel quantization n = 1,2,3...
        "palette": palette // an array of colors as rgb arrays
        "className": "dither" // can be whatever class used in the constructor
        "algorithm": "ordered" // can be "ordered", "atkinson" or "errorDiffusion"
    };


The monochrome branch supports also:

    "monochrome": true

DitherJSInternals exposes dither method for advanced useage:

    DitherJSInternals.dither(
        input,            // canvas or context object
        algorithum_name,  // (see options above)
        palette,          // (see options above)
        step,             // (see options above)
        output            // context or canvas to draw output
    );

There are a number of predefined paletts avalable as:

    DitherJSInternals.palettes


### Testimonials

* Useful as a comb to a bald man. -Anon
* One of the most important javascript library's of the 21st century. -Allan Callaghan

### Changelog

- Refactored lib to expose DitherJSInternals
- jquery plugin wrapper

author 2014 [Daniele Piccone](http://www.danielepiccone.com)

license [GPL](https://gnu.org/licenses/gpl.html)
