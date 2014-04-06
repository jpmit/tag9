// canvas.js
// Canvas handling

var CN = {};

CN.setCanvasSize = function () {
    canvas.width = window.innerWidth;
    console.log(document.getElementById("topbar").height);
    canvas.height = 0.9*window.innerHeight;
    console.log(canvas.width, canvas.height);

    if (GM) {
        GM.setSize(canvas.width, canvas.height);
    }
};

CN.init = function () { 
    window.onresize = CN.setCanvasSize;
}
