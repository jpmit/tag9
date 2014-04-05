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
        // shift
        THRUST: 16,
        // ctrl (right ctrl intended for use)
        FIRE: 17
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

// main game module ('module design pattern')
var GM = (function () {

    // if dummy, we use dummy inputs (see below)
    var dummy = false;

	 var FPS =  30;
    var DT = 1 / FPS; // ideal timestep, in seconds

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
    }

    function drawSprite (sprite) { 
	     ctx.save(); 
	     ctx.translate(sprite.x + sprite.hwidth, sprite.y + sprite.hheight);
	     ctx.rotate(sprite.angle);
	     ctx.drawImage(sprite.img, -sprite.hwidth, -sprite.hheight);
	     ctx.restore(); 
    }

    function addBullet (bullet) {
        bullets1.push(bullet);
    }

    // draw the complete game (called every frame)
    function draw () {
        var i, olength, psize, key, myid, ship;

	     // draw a blank screen
	     ctx.clearRect(0, 0, width, height);

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
        var key, i;
        Ship1.update(dt);
        Ship2.update(dt);
        for (i = 0; i < bullets1.length; i++) {
            bullets1[i].update(dt);
        }
        for (i = 0; i < bullets2.length; i++) {
            bullets2[i].update(dt);
        }
    }

    // process user input (called every frame)
    function processInput () {
        Ship1.processInput(KEY.pressed);
        Ship2.processInput(KEY.pressed);
    }    

    // mainloop of game, called every frame
    function main () {

        processInput();
	     // update with time in seconds
	     update(DT);

	     draw();

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
        ctx.fillStyle = 'white';
    
        // start the game
        Ship1 = new Ship([100, 100], 1);
        Ship2 = new Ship([500, 100], 2);

        // main routine
        main();
        setInterval(main, 1000 / FPS);
    }
    
    // public API
    return {setSize: setSize,
            init: init,
            addBullet: addBullet,
            }

}());
