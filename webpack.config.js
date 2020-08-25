module.exports = {
    entry: {
        "ditherjs": "./client.js",
        "jquery.ditherjs": "./jquery.js",
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].dist.js",
        library: 'DitherJS',
        libraryTarget: 'umd'
    }
};
