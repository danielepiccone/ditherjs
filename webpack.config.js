module.exports = {
    entry: {
        "ditherjs": "./src/ditherjs.js",
        "ditherjs.jquery": "./src/ditherjs.jquery.js",
    },
    output: {
        path: "./dist",
        filename: "[name].dist.js"
    }
};
