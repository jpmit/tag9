// canvas.js
// Handle canvas resizing.

var CN = {};

CN.setCanvasSize = function () {
    canvas.width = window.innerWidth;
    canvas.height = 0.9*window.innerHeight;

    if (GM) {
        GM.setSize(canvas.width, canvas.height);
    }
};

window.onresize = CN.setCanvasSize;
