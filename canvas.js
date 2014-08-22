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

    // called by game once loading complete
    function showCanvas() {
        canvas.style.display = 'block';
    }

    // public API
    return {setCanvasSize: setCanvasSize,
            showCanvas: showCanvas};
}());

window.onresize = CN.setCanvasSize;
