// canvas.js
// Canvas handling

var CN = {};

CN.setCanvasSize = function () {
    canvas.width = window.innerWidth;
    canvas.height = 0.9*window.innerHeight;

    if (GM) {
        GM.setSize(canvas.width, canvas.height);
    }
};

CN.init = function () { 
    window.onresize = CN.setCanvasSize;
}
