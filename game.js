// game.js
// Copyright (c) James Mithen 2014.
// The main game logic.

'use strict';

/*jslint browser:true */

// global game state that can be accessed by one and all
var GMSTATE = {
    arenaSize: {xmin: Number.MIN_VALUE,
                ymin: Number.MIN_VALUE,
                xmax: Number.MAX_VALUE,
                ymax: Number.MAX_VALUE,
               },
    // the rectangles inside the arena, neither the players nor the
    // bullets can pass through these.
    arenaRects : [],
    // is at least one of the players currently dead?
    isDead: false,
    // total game time elapsed in s
    gameTime: 0
};

// main game module ('module design pattern')
var GM = (function () {
    /*global Ship*/
    /*global JUKE*/
    /*global COLL*/
    /*global KEY*/
    /*global CN*/
    /*global AI*/

    // frames per second for the logic (and the rendering if
    // RequestAnimationFrame is not supported)
    var fps =  40,
        wallwidth = 5, // in pixels
        ctx, // the context for drawing to
        then = Date.now(),
        width,
        height,
        Ship1 = new Ship([-100, -100], 1),
        Ship2 = new Ship([-100, -100], 2),
        eps = 0.000001, // for floating point arithmetic
        bullets1 = [],
        bullets2 = [],
        inPlay,
        deadText,
        deadTime,
        // the three starfields that make up the background
        stars1,
        stars2,
        stars3;

    GMSTATE.arenaSize.xmin = wallwidth;
    GMSTATE.arenaSize.ymin = wallwidth;

    // thinly adapted from 'Professional HTML5 Mobile Game
    // Development' by Pascal Rettig.
    function Starfield(speed, opacity, starsPerArea, clear, color) {
        var stars = document.createElement("canvas"),
            starCtx = stars.getContext("2d"),
            numStars = Math.round(width * height * starsPerArea),
            offset = 0,
            i;
        stars.width = width;
        stars.height = height;

        if (clear) {
            starCtx.fillstyle = "#000";
            starCtx.fillRect(0, 0, stars.width, stars.height);
        }
        starCtx.fillStyle = color;
        starCtx.globalAlpha = opacity;
        for (i = 0; i < numStars; i += 1) {
            starCtx.fillRect(Math.floor(Math.random() * stars.width),
                             Math.floor(Math.random() * stars.height),
                             2, 2);
        }

        this.draw = function () {
            var intOffset = Math.floor(offset),
                remaining = stars.width - intOffset;
            if (intOffset > 0) {
                ctx.drawImage(stars, remaining, 0, intOffset,
                              stars.height, 0, 0, intOffset, stars.height);
            }
            if (remaining > 0) {
                ctx.drawImage(stars, 0, 0, remaining, stars.height,
                              intOffset, 0, remaining, stars.height);
            }
        };

        this.update = function (dt) {
            offset += dt * speed;
            offset = offset % stars.width;
        };
    }

    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // create obstacles in the arena: note these are scaled in the
    // long direction only, but fixed in the short direction.  This
    // ensures no problems with the collision physics (hopefully).
    function createArenaRects() {
        var arenaRects = [],
            // player 1 pen (bottom right)
            r11 = new Rect(Math.floor(0.05 * width), Math.floor(0.7 * height),
                           Math.floor(0.1 * width), 20),
            r12 = new Rect(Math.floor(0.05 * width) + Math.floor(0.1 * width) - 20,
                           Math.floor(0.7 * height),
                           20, Math.floor(0.2 * height)),

            // player 2 pen (top right)
            r21 = new Rect(Math.floor(0.85 * width),
                           Math.floor(0.3 * height) - 20, Math.floor(0.1 * width), 20),
            r22 = new Rect(Math.floor(0.85 * width), Math.floor(0.1 * height), 20,
                           Math.floor(0.2 * height)),
            // central objects
            rc = new Rect(Math.floor(0.5 * width) - 10, Math.floor(0.3 * height), 20,
                          Math.floor(0.4 * height));

        arenaRects.push(r11);
        arenaRects.push(r12);
        arenaRects.push(r21);
        arenaRects.push(r22);
        arenaRects.push(rc);
        GMSTATE.arenaRects = arenaRects;
    }

    // initialise ships etc.
    function setGameStart() {
        inPlay = false;
        GMSTATE.isDead = false;
        AI.reset();
        Ship1.reset([0.9 * width, 0.1 * height]);
        Ship2.reset([0.05 * width, 0.8 * height]);
    }

    // called when we resize the canvas (and also initially) warning!
    // resizing resets the entire canvas context (e.g. ctx.fillStyle).
    function setCanvas(canvas) {

        ctx = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;

        GMSTATE.arenaSize.xmax = width - wallwidth;
        GMSTATE.arenaSize.ymax = height - wallwidth;

        stars1 = new Starfield(20, 0.2, 0.001, true, "#FFF");
        stars2 = new Starfield(50, 0.4, 0.001, false, "#F00");
        stars3 = new Starfield(80, 0.6, 0.0005, false, "#FFF");

        createArenaRects();
        // reset canvas details
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#FFF';
        ctx.font = "20px Monospace";

        // set game state to start (will reset ship positions)
        setGameStart();
    }

    // general function for drawing a 'sprite' at a given angle, used
    // to draw ships and bullets.
    function drawSprite(sprite) {
        ctx.save();
        ctx.translate(sprite.x + sprite.hwidth, sprite.y + sprite.hheight);
        ctx.rotate(sprite.angle);
        if (sprite.alpha) {
            ctx.globalAlpha = sprite.alpha;
        }
        ctx.drawImage(sprite.img, -sprite.hwidth, -sprite.hheight);
        ctx.restore();
    }

    function addBullet(num, bullet) {
        if (num === 1) {
            bullets1.push(bullet);
        } else {
            bullets2.push(bullet);
        }
    }

    // this uses augmented Array method (remove), see util.js
    function removeBullet(num, bullet) {
        if (num === 1) {
            bullets1.remove(bullet);
        } else {
            bullets2.remove(bullet);
        }
    }

    function drawArenaRects() {
        var i, rl, r;
        rl = GMSTATE.arenaRects.length;
        ctx.fillStyle = '#FFF';
        for (i = 0; i < rl; i += 1) {
            r = GMSTATE.arenaRects[i];
            ctx.fillRect(r.x, r.y, r.width, r.height);
        }
    }

    // health bars above ships
    function drawHealth() {
        var i, ships, s;
        ships = [Ship1, Ship2];

        ctx.save();
        for (i = 0; i !== ships.length; i += 1) {
            s = ships[i];
            if (!s.dead) {
                // white rectangle
                ctx.fillStyle = '#FFF';
                ctx.fillRect(s.x, s.y - 15, 40, 5);
                if (s.health < 30) {
                    ctx.fillStyle = '#FF0000';
                } else if (s.health < 60) {
                    ctx.fillStyle = '#FF6C00';
                } else {
                    ctx.fillStyle = '#00FF00';
                }
                ctx.fillRect(s.x, s.y - 15, Math.floor(0.4 * s.health), 5);
            }
        }
        ctx.restore();
    }

    // 'halo' (circle) around ship currently ahead
    function drawLeader() {
        var lead;
        if (Ship1.health > Ship2.health + eps) {
            lead = Ship1;
        } else if (Ship2.health > Ship1.health + eps) {
            lead = Ship2;
        }

        if (lead) {
            ctx.beginPath();
            ctx.arc(lead.x + lead.hwidth, lead.y + lead.hheight,
                    15, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    // main draw function (called every frame)
    function draw() {
        var i;

        // draw background
        stars1.draw();
        stars2.draw();
        stars3.draw();

        // health
        drawHealth();

        if (GMSTATE.isDead) {
            ctx.fillText(deadText,
                         width / 2 - 400, height / 2 - 150);
        }

        if (!inPlay) {
            ctx.fillText("Press any key to start",
                         width / 2 - 330, height / 2 - 50);
        }

        // obstacles inside the arena
        drawArenaRects();

        // ships
        drawSprite(Ship1);
        drawSprite(Ship2);

        // draw a circle around the ship that is currently ahead
        drawLeader();

        // bullets
        for (i = 0; i !== bullets1.length; i += 1) {
            drawSprite(bullets1[i]);
        }
        for (i = 0; i !== bullets2.length; i += 1) {
            drawSprite(bullets2[i]);
        }
    }

    function incrementScores(inc1, inc2) {
        var score1, score2;
        score1 = document.getElementById("p1score");
        score2 = document.getElementById("p2score");

        score1.innerHTML = parseInt(score1.innerHTML, 10) + inc1;
        score2.innerHTML = parseInt(score2.innerHTML, 10) + inc2;
    }

    // called by main update fn if we are currently in 'dead' state
    function updateDead(dt) {
        if (!GMSTATE.isDead) {
            // first time we know about dead
            JUKE.jukebox.playSfx('dead');
            bullets1 = [];
            bullets2 = [];
            // figure out who died (maybe both)
            if (Ship1.health < Ship2.health - eps) {
                if (Ship2.isAi) {
                    deadText = 'AI WINS';
                } else {
                    deadText = '2P WINS';
                }
                incrementScores(0, 1);
            } else if (Ship2.health < Ship1.health - eps) {
                deadText = '1P WINS';
                incrementScores(1, 0);
            } else {
                deadText = 'DRAW';
                incrementScores(1, 1);
            }
            GMSTATE.isDead = true;
            deadTime = 0;
        }
        deadTime += dt;

        // restart the players for next round...
        if (deadTime > 3) {
            setGameStart();
        }
    }

    // main update function (called every frame)
    function update(dt) {
        var i;

        if (!inPlay) {
            return;
        }

        Ship1.update(dt);
        Ship2.update(dt);

        if ((Ship1.dead) || (Ship2.dead)) {
            updateDead(dt);
        }

        for (i = 0; i < bullets1.length; i += 1) {
            bullets1[i].update(dt);
        }
        for (i = 0; i < bullets2.length; i += 1) {
            bullets2[i].update(dt);
        }

        COLL.collideShip(Ship1, Ship2);
        COLL.collideBullets(Ship1, bullets2);
        COLL.collideBullets(Ship2, bullets1);

        // move background
        stars1.update(dt);
        stars2.update(dt);
        stars3.update(dt);
    }

    // process user input (called every frame)
    function processInput() {
        var i;

        if (inPlay) {
            Ship1.processInput(KEY.pressed);
            Ship2.processInput(KEY.pressed);
        } else {
            // wait on keydown event
            for (i = 0; i < KEY.events.length; i += 1) {
                if (KEY.events[i].down) {
                    inPlay = true;
                    GMSTATE.gameTime = 0;
                }
            }
        }
        // clear events so we don't handle them next frame
        KEY.events = [];
    }

    // called by window.onload
    function init() {
        var x, mainDraw;

        // configure canvas
        CN.setCanvasSize();

        // set game state to start
        setGameStart();

        // requestAnimationFrame
        (function () {
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for (x = 0; x < vendors.length && !window.requestAnimFrame; x += 1) {
                window.requestAnimFrame = window[vendors[x] + 'RequestAnimationFrame'];
            }
        }());

        // we use setInterval for the logic, and requestAnimationFrame
        // for the *drawing only*. If requestAnimationFrame is not
        // supported, the entire game loop is executed by a single
        // setTimeout call (hence why we don't have a setTimeout
        // fallback above).
        if (!window.requestAnimFrame) {
            mainDraw = draw;
        } else {
            mainDraw = function () { return; };
        }

        // logic only (and draw if requestAnimationFrame not supported)
        function main() {
            var now = Date.now(),
                // time elapsed since last tick in s
                dt = (now - then) / 1000;
            GMSTATE.gameTime += dt;
            processInput();
            update(dt);
            mainDraw();
            then = now;
        }

        // display the div
        document.getElementById("loader").style.display = 'none';
        document.getElementById("topbar").style.display = 'block';
        CN.showCanvas();


        window.setInterval(main, 1000 / fps);

        function keepDrawing() {
            draw();
            window.requestAnimFrame(keepDrawing);
        }

        if (window.requestAnimFrame) {
            window.requestAnimFrame(keepDrawing);
        }
    }

    // called via select box on the html page
    function setAi(aiString) {
        if (aiString === "AI") {
            Ship2.isAi = true;
        } else {
            Ship2.isAi = false;
        }
    }

    function getShip(num) {
        if (num === 1) {
            return Ship1;
        }
        return Ship2;
    }

    // public API
    return {setCanvas: setCanvas,
            init: init,
            addBullet: addBullet,
            removeBullet: removeBullet,
            getShip: getShip,
            setAi: setAi
            };
}());
