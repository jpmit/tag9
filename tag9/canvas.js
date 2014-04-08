// canvas.js
// Copyright (c) James Mithen 2014.
// Handle canvas resizing.

'use strict';

var CN = (function () {
    /*jslint browser:true */
    /*global GM*/
    var canvas = document.getElementById("game");

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = 0.9 * window.innerHeight;
        if (GM.setCanvas) {
            GM.setCanvas(canvas);
        }
        return canvas;
    }

    // public API
    return {setCanvasSize: setCanvasSize};
}());

window.onresize = CN.setCanvasSize;
