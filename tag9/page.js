// page.js
// Copyright (c) James Mithen 2014.
// setup event handlers on the html page.

'use strict';

(function () {
    /*jslint browser:true */
    /*global JUKE*/
    /*global GM*/
    /*global SHIP*/

    var instruct = document.getElementById("instructions"),
        itxt = document.getElementById("instructiontxt"),
        sbut = document.getElementById("sbutton"),
        gtype = document.getElementById("gametype"),
        zscore = document.getElementById("zeroscore"),
        dtime = document.getElementById("decaytime");

    // instructions
    instruct.onclick = function () {
        var shown = (itxt.style.display === 'block');
        if (shown) {
            itxt.style.display = 'none';
            instruct.innerHTML = 'Instructions';
        } else {
            itxt.style.display = 'block';
            instruct.innerHTML = 'Hide';
        }
    };

    // sound on/off
    sbut.onclick = function () {
        var value = sbut.value;
        if (value === 'on') {
            sbut.value = 'off';
            JUKE.jukebox.mute();
        } else {
            sbut.value = 'on';
            JUKE.jukebox.unmute();
        }
        sbut.innerHTML = sbut.value;
    };

    // 2 player or AI
    gtype.onchange = function () {
        var newtxt, value = gtype.value;
        if (value === 'ai') {
            newtxt = "AI";
        } else {
            newtxt = "2P";
        }
        document.getElementById("player2id").innerHTML = newtxt;
        GM.setAi(newtxt);
    };

    // health decay time
    dtime.onchange = function () {
        var value = dtime.value;
        SHIP.setDecayTime(value);
    };

    // reset scores
    zscore.onclick = function () {
        document.getElementById("p1score").innerHTML = 0;
        document.getElementById("p2score").innerHTML = 0;
    };

}());
