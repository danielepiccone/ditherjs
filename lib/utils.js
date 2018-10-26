exports.defaultPalette = [
    [0, 0, 0],
    [255, 0, 255],
    [0, 255, 255],
    [255, 255, 255]
];

exports.errors = {
    CanvasNotPresent: new Error('CanvasNotPresent'),
    TargetNotBuffer: new Error('TargetNotBuffer'),
    InvalidAlgorithm: new Error('InvalidAlgorithm')
};

exports.targetTypes = {
    selector: 'SELECTOR',
    buffer: 'BUFFER'
};

exports.Canvas = null;

try {
    exports.Canvas = require("canvas");
} catch (e) {
    exports.Canvas = null;
}
