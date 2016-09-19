var DitherJS = (function( $ ) {
    $.fn.ditherJS = function(options) {
        var DitherJS = require('./lib/client');
        var ditherjs = new DitherJS(options);
        ditherjs.dither(this.selector);
    };
}( jQuery ));

module.exports = DitherJS;
