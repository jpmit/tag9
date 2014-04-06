// game.js
// The main game logic.

var canvas = document.getElementById("game");

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
	 pressed: {},
    // array storing all used key codes
    allkeys: [],
    // store events (clear this every frame)
    events: []
};

KEY.allkeys = (function () {
    var pl, k, i, allkeys = [];
    var parray = [KEY.player1, KEY.player2]
    for (i = 0; i != parray.length; ++i) {
        pl = parray[i];
        console.log(pl);
        for (k in pl) {
            if (pl.hasOwnProperty(k)) {
                allkeys.push(pl[k]);
            }
        }
    }
    return allkeys;
}());
console.log(KEY.allkeys);

var GLOBALS = {
    arenaSize: {xmin: Number.MIN_VALUE,
                ymin: Number.MIN_VALUE,
                xmax: Number.MAX_VALUE,
                ymax: Number.MAX_VALUE,
               },
    // the rectangles inside the arena, neither the players nor the
    // bullets can pass through these.
    arenaRects : []
};
    

// main game module ('module design pattern')
var GM = (function () {

	 var FPS =  30;
    var WALLWIDTH = 5; // in pixels
    GLOBALS.arenaSize.xmin = WALLWIDTH;
    GLOBALS.arenaSize.ymin = WALLWIDTH;

    var then = Date.now();
    var now;

    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    var Ship1, Ship2;
    var bullets1 = [];
    var bullets2 = [];
    var inPlay;

    // the three starfields that make up the background
    var stars1, stars2, stars3;

    function Starfield (speed, opacity, starsPerArea, clear, color) {
        var stars = document.createElement("canvas");
        var numStars = Math.round(width*height*starsPerArea);
        stars.width = width;
        stars.height = height;

        var starCtx = stars.getContext("2d");
        var offset = 0;

        if (clear) {
            starCtx.fillstyle = "#000";
            starCtx.fillRect(0, 0, stars.width, stars.height);
        }
        starCtx.fillStyle = color;
        starCtx.globalAlpha = opacity;
        for (var i = 0; i < numStars; ++i) {
            starCtx.fillRect(Math.floor(Math.random()*stars.width),
                             Math.floor(Math.random()*stars.height),
                             2, 2);
        }

        this.draw = function () {
            var intOffset = Math.floor(offset);
            var remaining = stars.width - intOffset;
            if (intOffset > 0) {
                ctx.drawImage(stars, remaining, 0, intOffset,
                              stars.height, 0, 0, intOffset, stars.height);
            }
            if (remaining > 0) {
                ctx.drawImage(stars, 0, 0, remaining, stars.height,
                              intOffset, 0, remaining, stars.height);
            }
        }

        this.update = function (dt) {
            offset += dt * speed;
            offset = offset % stars.width;
        }
    }
    
    function Rect (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // create obstacles in the arena: note these are scaled in the
    // long direction only, but fixed in the short direction.  This
    // ensures no problems with the collision physics (hopefully).
    function createArenaRects () {
        var arenaRects = [];

        // player 1 pen (bottom right)
        var r11 = new Rect(Math.floor(0.05*width), Math.floor(0.7*height), 
                           Math.floor(0.1*width), 20);
        var r12 = new Rect(Math.floor(0.05*width) + Math.floor(0.1*width) - 20, 
                           Math.floor(0.7*height), 
                           20, Math.floor(0.2*height));

        // player 2 pen (top right)
        var r21 = new Rect(Math.floor(0.85*width), 
                           Math.floor(0.3*height) - 20, Math.floor(0.1*width), 20);
        var r22 = new Rect(Math.floor(0.85*width), Math.floor(0.1*height), 20, 
                           Math.floor(0.2*height));

        // central objects
        var rc = new Rect(Math.floor(0.5*width) - 10, Math.floor(0.3*height), 20, 
                          Math.floor(0.4*height));

        arenaRects.push(r11);
        arenaRects.push(r12);
        arenaRects.push(r21);
        arenaRects.push(r22);
        arenaRects.push(rc);
        GLOBALS.arenaRects = arenaRects;
    }

    // called when we resize the canvas (and also initially) warning!
    // resizing resets the entire canvas context (e.g. ctx.fillStyle)
    function setSize (canvasWidth, canvasHeight) {
        width = canvasWidth;
        height = canvasHeight;

        GLOBALS.arenaSize.xmax = width - WALLWIDTH;
        GLOBALS.arenaSize.ymax = height - WALLWIDTH;

        stars1 = new Starfield(20, 0.2, 0.001, true, "#FFF");
        stars2 = new Starfield(50, 0.4, 0.001, false, "#F00");
        stars3 = new Starfield(80, 0.6, 0.0005, false, "#FFF");

        createArenaRects();
        // reset canvas details
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#FFF';
        ctx.font = "20px Monospace";
    }

    function drawSprite (sprite) { 
	     ctx.save(); 
	     ctx.translate(sprite.x + sprite.hwidth, sprite.y + sprite.hheight);
	     ctx.rotate(sprite.angle);
        if (sprite.alpha) {
            console.log(sprite.alpha);
            ctx.globalAlpha = sprite.alpha;
        }
	     ctx.drawImage(sprite.img, -sprite.hwidth, -sprite.hheight);
	     ctx.restore(); 
    }

    function addBullet (num, bullet) {
        if (num === 1) {
            bullets1.push(bullet);
        }
        else {
            bullets2.push(bullet);
        }
    }

    function removeBullet (num, bullet) {
        if (num === 1) {
            bullets1.remove(bullet);
        }
        else {
            bullets2.remove(bullet);
        }
    }

    // not currently used: the walls are there but transparent
    function drawWalls () {

        ctx.fillRect(0, 0, WALLWIDTH, height);
        ctx.fillRect(width - WALLWIDTH, 0, WALLWIDTH, height);
        ctx.fillRect(0, 0, width, WALLWIDTH);
        ctx.fillRect(0, height - WALLWIDTH, width, WALLWIDTH);
    }

    function drawArenaRects () {
        var i, rl, r;
        rl = GLOBALS.arenaRects.length;

        for (i = 0; i < rl; ++i) {
            r = GLOBALS.arenaRects[i];
            ctx.fillRect(r.x, r.y, r.width, r.height);
        }
    }

    function drawHealth () {
        ctx.fillText(Math.floor(Ship1.health), 100, 50);
        ctx.fillText(Math.floor(Ship2.health), 400, 50);
    }

    function drawLeader () {
        var lead;
        if (Ship1.health > Ship2.health) {
            lead = Ship1;
        }
        else if (Ship2.health > Ship1.health) {
            lead = Ship2;
        }

        if (lead) {
            ctx.beginPath();
            ctx.arc(lead.x + lead.hwidth, lead.y + lead.hheight,
                    15,0,2*Math.PI);
            ctx.stroke();
        }
    }

    // main draw function (called every frame)
    function draw () {
        var i, olength, psize, key, myid, ship;

        // draw background
        stars1.draw();
        stars2.draw();
        stars3.draw();

        // health
        drawHealth();

        if (!inPlay) {
            ctx.fillText("Press any key to start", 
                         width / 2 - 400, height / 2 - 50);
        }

        // obstacles inside the arena
        drawArenaRects();

        // ships
        drawSprite(Ship1);
        drawSprite(Ship2);

        // draw a circle around the ship that is currently ahead
        drawLeader();

        // bullets
        for (i = 0; i !== bullets1.length; ++i) {
            drawSprite(bullets1[i]);
        }
        for (i = 0; i !== bullets2.length; ++i) {
            drawSprite(bullets2[i]);
        }
    }

    function incrementScores(inc1, inc2) {
        var score1, score2;
        score1 = document.getElementById("p1score");
        score2 = document.getElementById("p2score");

        score1.innerHTML = parseInt(score1.innerHTML) + inc1;
        score2.innerHTML = parseInt(score2.innerHTML) + inc2;
    }

    // initialise ships
    function startGame() {
        inPlay = false;
        Ship1 = new Ship([0.05*width, 0.8*height], 1);
        Ship2 = new Ship([0.9*width, 0.1*height], 2);
        bullets1 = [];
        bullets2 = [];
    }

    // main update function (called every frame)
    function update (dt) {
        var key, i, j, vels, v1, v2;

        if (!inPlay) {
            return;
        }

        Ship1.update(dt);
        Ship2.update(dt);

        for (i = 0; i < bullets1.length; i++) {
            bullets1[i].update(dt);
        }
        for (i = 0; i < bullets2.length; i++) {
            bullets2[i].update(dt);
        }
        
        COLL.collideShip(Ship1, Ship2);
        COLL.collideBullets(Ship1, bullets2);
        COLL.collideBullets(Ship2, bullets1);

        // move background
        stars1.update(dt);
        stars2.update(dt);
        stars3.update(dt);

        if ((Ship1.dead) || (Ship2.dead)) {
            JUKE.jukebox.playSfx('dead');
            incrementScores(Ship2.dead ? 1: 0, Ship1.dead ? 1: 0);
            // restart the players...
            startGame();
        }
    }

    // process user input (called every frame)
    function processInput () {

        if (inPlay) {
            Ship1.processInput(KEY.pressed);
            Ship2.processInput(KEY.pressed);
        }
        else {
            var i;
            for (i = 0; i < KEY.events.length; ++i) {
                if (KEY.events[i].down) {
                    inPlay = true;
                }
            }
        }
        // clear events so we don't handle them next frame
        KEY.events = [];
    }

    // called by window.onload
    function init () {

        var i, akeys;

        // set all pressed to False
        akeys = KEY.allkeys;
        for (i = 0; i < akeys.length; ++i) {
            KEY.pressed[akeys[i]] = false;
        }

        // handle any user input
        function inputListener (e) {
            var kc = e.keyCode;
            var down = e.type == "keydown" ? true : false;
            if ((!down) || (down && KEY.pressed[kc] === false)) {
                KEY.pressed[kc] = down;
            }
            // we only need this for restarting the game
            KEY.events.push({'down': down});
            e.preventDefault();
        }
        
        window.addEventListener("keydown", inputListener, false);
        window.addEventListener("keyup", inputListener, false);

        // configure canvas
        CN.setCanvasSize();
    
        // start the game
        startGame();

        // requestAnimationFrame
       (function(){
           var vendors = ['ms', 'moz', 'webkit', 'o'];
           for(var x = 0; x < vendors.length && !window.requestAnimFrame; ++x) {
               window.requestAnimFrame = window[vendors[x]+'RequestAnimationFrame'];
           }
       }());

        // we use setInterval for the logic, and requestAnimationFrame
        // for the *drawing only*. If requestAnimationFrame is not
        // supported, the entire game loop is executed by a single
        // setTimeout call (hence why we don't have a setTimeout
        // fallback above).
        var mainDraw;
        if (!window.requestAnimFrame) {
            mainDraw = draw;
        }
        else {
            mainDraw = function () {};
        }
        console.log(mainDraw);

        // logic only (and draw if requestAnimationFrame not supported)
        function main() {
	         var now = Date.now();
	         var dt = now - then;
	         processInput();
            update(dt / 1000);
            mainDraw();
	         then = now;
        }

        window.setInterval(main, 1000 / FPS);
            
        if (window.requestAnimFrame) {
            function keepDrawing() {
                draw();
                window.requestAnimFrame(keepDrawing);
            }
            window.requestAnimFrame(keepDrawing);
        }
    }
    
    // public API
    return {setSize: setSize,
            init: init,
            addBullet: addBullet,
            removeBullet: removeBullet
            }

}());
