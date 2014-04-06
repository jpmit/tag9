// setup event handlers on the html page
(function () {
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
    }

    var dtime = document.getElementById("decaytime");
    dtime.onchange = function () {
        var value = dtime.value;
        SHIP.setDecayTime(value);
    }

    var zscore = document.getElementById("zeroscore");
    zscore.onclick = function () {
        document.getElementById("p1score").innerHTML = 0;
        document.getElementById("p2score").innerHTML = 0;
    }
}());

