// page.js
// setup event handlers on the html page.

(function () {

    // instructions
    var instruct = document.getElementById("instructions");
    var itxt = document.getElementById("instructiontxt");
    instruct.onclick = function () {
        var shown = (itxt.style.display === 'block');
        if (shown) {
            itxt.style.display = 'none';
            instruct.innerHTML = 'Instructions';
        }
        else {
            itxt.style.display = 'block';
            instruct.innerHTML = 'Hide';
        }
    }

    // sound on/off
    var sbut = document.getElementById("sbutton");
    sbut.onclick = function () {
        var value = sbut.value;
        if (value === 'on') {
            sbut.value = 'off';
            JUKE.jukebox.mute();
        }
        else {
            sbut.value = 'on';
            JUKE.jukebox.unmute();
        }
        sbut.innerHTML = sbut.value;
    };

    // 2 player or AI
    var gtype = document.getElementById("gametype");
    gtype.onchange = function () {
        var value = gtype.value;
        var newtxt;
        if (value === 'ai') {
            newtxt = "AI";
        }
        else {
            newtxt = "2P";
        }
        document.getElementById("player2id").innerHTML = newtxt;
        GM.setAi(newtxt);
    }

    // health decay time
    var dtime = document.getElementById("decaytime");
    dtime.onchange = function () {
        var value = dtime.value;
        SHIP.setDecayTime(value);
    }

    // reset scores
    var zscore = document.getElementById("zeroscore");
    zscore.onclick = function () {
        document.getElementById("p1score").innerHTML = 0;
        document.getElementById("p2score").innerHTML = 0;
    }

}());
