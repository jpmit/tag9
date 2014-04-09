// ai.js
// Copyright (c) James Mithen 2014.
// AI for single player mode

'use strict';

/*global GMSTATE*/

var AI = {};

AI.getpressed = function (ship) {
    var keys = ship.keys,
        pressed = {};
    console.log(GMSTATE.gameTime);
    if (GMSTATE.gameTime < 1) {
        pressed[keys.LEFT] = true;
    } else if (GMSTATE.gameTime < 2) {
        pressed[keys.UP] = true;
        pressed[keys.RIGHT] = true;
    }
    return pressed;
};
