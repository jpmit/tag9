// key.js
// Copyright (c) James Mithen 2014.
// Keyboard stuff

'use strict';

// track pressed keys
var KEY = {
    // map actions to javascript key codes
    player1: {
        // normal arrow keys
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        // ctrl (right ctrl intended for use)
        THRUST: 17,
        // shift
        FIRE: 16
    },
    player2: {
        // wasd
        LEFT: 65,
        UP: 87,
        RIGHT: 68,
        DOWN: 83,
        // tab
        THRUST: 9,
        // q
        FIRE: 81
    },
    // pressed stores keycode as key, boolean as value
    pressed: {},
    // array storing all used key codes
    allkeys: [],
    // store events (clear this every frame)
    events: []
};

KEY.allkeys = (function () {
    var pl, k, i, allkeys, parray;
    allkeys = [];
    parray = [KEY.player1, KEY.player2];
    for (i = 0; i !== parray.length; i += 1) {
        pl = parray[i];
        for (k in pl) {
            if (pl.hasOwnProperty(k)) {
                allkeys.push(pl[k]);
            }
        }
    }
    return allkeys;
}());

// initialisation
(function () {
    /*jslint browser:true */
    var i,
        akeys = KEY.allkeys;
    // set all pressed to False
    for (i = 0; i < akeys.length; i += 1) {
        KEY.pressed[akeys[i]] = false;
    }

    // handle any user input
    function inputListener(e) {
        var kc, down;
        kc = e.keyCode;
        down = e.type === "keydown" ? true : false;
        if ((!down) || (down && KEY.pressed[kc] === false)) {
            KEY.pressed[kc] = down;
        }
        // we only store whether the event is keydown or keyup,
        // and not the keycode; this is only used for restarting
        // the game.
        KEY.events.push({'down': down});
        e.preventDefault();
    }

    window.addEventListener("keydown", inputListener, false);
    window.addEventListener("keyup", inputListener, false);
}());
