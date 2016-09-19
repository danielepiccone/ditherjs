function orderedDither(uint8data, palette, step, h, w) {
    var d = new Uint8ClampedArray(uint8data);
    var ratio = 3;
    var m = new Array(
        [  1,  9,  3, 11 ],
        [ 13,  5, 15,  7 ],
        [  4, 12,  2, 10 ],
        [ 16,  8, 14,  6 ]
    );

    var r, g, b, a, i, color, approx, tr, tg, tb, dx, dy, di;

    for (var y=0;y<h;y += step) {
        for (var x=0;x<w;x += step) {
            i = (4*x) + (4*y*w);

            // Define bytes
            r = i;
            g = i+1;
            b = i+2;
            a = i+3;

            d[r] += m[x%4][y%4] * ratio;
            d[g] += m[x%4][y%4] * ratio;
            d[b] += m[x%4][y%4] * ratio;

            color = new Array(d[r],d[g],d[b]);
            approx = this.approximateColor(color, palette);
            tr = approx[0];
            tg = approx[1];
            tb = approx[2];

            // Draw a block
            for (dx=0;dx<step;dx++){
                for (dy=0;dy<step;dy++){
                    di = i + (4 * dx) + (4 * w * dy);

                    // Draw pixel
                    d[di] = tr;
                    d[di+1] = tg;
                    d[di+2] = tb;

                }
            }
        }
    }
    return d;
}

module.exports = orderedDither;
