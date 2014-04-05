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
    allkeys: []
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
               }
};
    

// main game module ('module design pattern')
var GM = (function () {

	 var FPS =  30;
    var WALLWIDTH = 20; // in pixels
    GLOBALS.arenaSize.xmin = WALLWIDTH;
    GLOBALS.arenaSize.ymin = WALLWIDTH;

    var then = Date.now();
    var now;

    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    var Ship1, Ship2;
    var bullets1 = []
    var bullets2 = [];

    function setSize (canvasWidth, canvasHeight) {
        width = canvasWidth;
        height = canvasHeight;
        // resizing resets the entire canvas context
        ctx.fillStyle = 'white';
        GLOBALS.arenaSize.xmax = width - WALLWIDTH;
        GLOBALS.arenaSize.ymax = height - WALLWIDTH;
    }

    function drawSprite (sprite) { 
	     ctx.save(); 
	     ctx.translate(sprite.x + sprite.hwidth, sprite.y + sprite.hheight);
	     ctx.rotate(sprite.angle);
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

    function drawWalls () {
        ctx.fillRect(0, 0, WALLWIDTH, height);
        ctx.fillRect(width - WALLWIDTH, 0, WALLWIDTH, height);
        ctx.fillRect(0, 0, width, WALLWIDTH);
        ctx.fillRect(0, height - WALLWIDTH, width, WALLWIDTH);
    }

    // draw the complete game (called every frame)
    function draw () {
        var i, olength, psize, key, myid, ship;

	     // draw a blank screen
	     ctx.clearRect(0, 0, width, height);

        // arena walls
        drawWalls();

        // ships
        drawSprite(Ship1);
        drawSprite(Ship2);

        // bullets
        for (i = 0; i !== bullets1.length; ++i) {
            drawSprite(bullets1[i]);
        }
        for (i = 0; i !== bullets2.length; ++i) {
            drawSprite(bullets2[i]);
        }
    }

    // update local game state (called every frame)
    function update (dt) {
        var key, i, j, vels, v1, v2;

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
    }

    // process user input (called every frame)
    function processInput () {
        Ship1.processInput(KEY.pressed);
        Ship2.processInput(KEY.pressed);
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
            e.preventDefault();
        }
        
        window.addEventListener("keydown", inputListener, false);
        window.addEventListener("keyup", inputListener, false);

        // configure canvas
        CN.setCanvasSize();
    
        // start the game
        Ship1 = new Ship([100, 100], 1);
        Ship2 = new Ship([500, 100], 2);

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
