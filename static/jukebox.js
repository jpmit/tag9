var JUKE = {};

JUKE.Jukebox = function () {
    var test = new Audio();
    var ext;
    this.music = {};
    this.sfx = {};
    var playingMusic = false;
    var playingName = "";
    var muted = false;

    if (test.canPlayType("audio/ogg") !== "") {
        ext = "ogg";
    }
    else if (test.canPlayType("audio/mp3") !== "") {
        ext = "mp3";
    }

    function loadAudio (nameMap, store, loop, volume) {
        for (k in nameMap) {
            if (nameMap.hasOwnProperty(k)) {
                m = new Audio(nameMap[k] + "." + ext);
                m.loop = loop;
                m.volume = volume;
                m.load();
                store[k] = m;
            }
        }
    }

    this.loadMusic = function (musicMap) {
        loadAudio(musicMap, this.music, true, 0.25);
    };

    this.loadSfx = function (sfxMap) {
        loadAudio(sfxMap, this.sfx, false, 0.7);
    };

    this.playMusic = function (name) {
        if (!muted && !playingMusic) {
            this.music[name].play();
            playingMusic = true;
            playingName = name;
        }
    };

    this.stopMusic = function () {
        if (playingMusic) {
            this.music[playingName].pause();
            playingMusic = false;
            // just in case
            playingName = "";
        }
    }

    this.playSfx = function (name) {
        if (!muted) {
            this.sfx[name].play();
        }
    };

    this.mute = function () {
        muted = true;
        this.stopMusic()
    };

    this.unmute = function () {
        muted = false;
        this.playMusic('main');
    };
}

// jukebox for audio
JUKE.jukebox = new JUKE.Jukebox();
JUKE.jukebox.loadMusic({'main': 'audio/Game_Track',
                        'menu': 'audio/Menu_Track'
                       });
JUKE.jukebox.loadSfx({'laser1': 'audio/laser1',
                      'laser2': 'audio/laser2',
                      'hit1' : 'audio/hit1',
                      'hit2' : 'audio/hit2',
                      'dead' : 'audio/atari',
                      'shipcollide' : 'audio/coll',
                      'alarm' : 'audio/alarm'});
JUKE.jukebox.playMusic('main');
