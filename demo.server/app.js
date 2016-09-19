var http = require("http");
var fs = require('fs');
var path = require('path');
var DitherJs = require('../server.js');

var server = http.createServer(function(req, res) {
    fs.readFile(path.resolve(__dirname, "parrot.jpg"), function (err, data) {
        if (err) {
            throw err;
        }
        res.writeHead(200, {"Content-Type": "image/jpeg"});
        var options = {
            step: 3
        };
        res.write(new DitherJs(options).dither(data));
        res.end();
    });
});


server.listen(8081);
console.log('Demo running on port 8081');
