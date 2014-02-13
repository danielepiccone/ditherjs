/**
* jQuery plugin definition
* */
;(function( $ ) {
    $.fn.ditherJS = function(opt) {
            new DitherJS(this.selector,opt);            
        return this;
    };
}( jQuery ));
