// ship.js
// Ship (sic) and bullet logic.

var SHIP = {
    vmax: 300,  // maximum speed
    // if true, 'thruster' is always on
    permanentThrust: true,
    a: 30,
    aThrust: 300,
    gamma: 0.1,
    rotv: 3,
    noRotate: 0,
    leftRotate: -1,
    rightRotate: 1,
    decaySpeed: 100 / 30,
    health: 100 // initial health
};

SHIP.setDecayTime = function (value) {
    console.log(value);
    // decay time is time it takes (in seconds) to reach zero health
    // if not hit at all: we start with 100 points of health, so
    // decaySpeed = 100 / decayTime.
    SHIP.decaySpeed = 100 / parseInt(value);
}

var BULLET = {
    v: 500,
    coolDown: 0.4,
    tSince: 1000,
    // images for the different bullet types
    img: {},
    // how much damage in points (players start with 100) that a
    // bullet does.
    damage: 2
};

// load bullet images
(function () {
    var img1 = new Image();
    var img2 = new Image();
    function onloadBullet(img, bulletNum) {
        BULLET.img[bulletNum] = img;
        BULLET.width = img.width;
        BULLET.height = img.height;
        // store half the width of the bullet and half the length
        BULLET.hwidth = BULLET.width/2;
        BULLET.hheight = BULLET.height/2;
    }
    img1.onload = onloadBullet(img1, 1);
    img2.onload = onloadBullet(img2, 2);
    img1.src = "bullet1.png";
    img2.src = "bullet2.png";
}());

function Bullet(num, x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.img = BULLET.img[num];
    this.hwidth = BULLET.hwidth;
    this.hheight = BULLET.hwidth;

    this.vx = Math.sin(this.angle)*BULLET.v;
    this.vy = -Math.cos(this.angle)*BULLET.v;

    this.update = function(dt) {
        var asize = GLOBALS.arenaSize;
        var rects = GLOBALS.arenaRects;
        var i, r, rl;

        this.x = this.x + this.vx*dt;
        this.y = this.y + this.vy*dt;

        // check if the bullet is outside the arena.  We ignore the
        // (negligible) size of the bullets here.
        if (this.x < asize.xmin || this.x > asize.xmax 
            || this.y < asize.ymin || this.y > asize.ymax) {
            GM.removeBullet(num, this);
        }

        // check if bullet has hit one of the obstacles in the arena
        // (again ignore bullet size).
        rl = rects.length;
        for (i = 0; i < rl; ++i) {
            r = rects[i];
            if (this.x > r.x && this.x < r.x + r.width &&
                this.y > r.y && this.y < r.y + r.height) {
                GM.removeBullet(num, this);
            }
        }
    }
}

function Ship (pos, shipNum) {
    var img, that;

    that = this;
    img = new Image();
    img.src = "spaceship" + shipNum + ".png";
    img.onload = function () {
        that.width = img.width;
        that.height = img.height;
        that.hwidth = img.width/2;
        that.hheight = img.height/2;
    };
    this.img = img;
    this.health = SHIP.health;
    this.dead = false;
    this.flashing = false;
    this.flasht = 0;

    // num should be either 1 (player 1) or 2 (player 2)
    this.num = shipNum;
    if (this.num === 1) {
        this.keys = KEY.player1;
    }
    else if (this.num === 2) {
        this.keys = KEY.player2;
    }

    // position, velocity and accelaration
    this.x = pos[0];
    this.y = pos[1];
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    // orientation angle measure clockwise from 'up' direction
    this.angle = 0;
    this.rot = SHIP.noRotate;
    // thruster on this frame?
    this.thruster = false;
    // fired a bullet this frame?
    this.fired = false;

    this.processInput = function(pressed) {
        var a, keys = this.keys;

        if (this.thruster) {
            a = SHIP.aThrust;
        }
        else {
            a = SHIP.a;
        }

        // accelaration
        if (pressed[keys.UP]) {
            this.ay = -Math.cos(this.angle)*a;
            this.ax = Math.sin(this.angle)*a;
        }
        else if (pressed[keys.DOWN]) {
            this.ay = Math.cos(this.angle)*a;
            this.ax = -Math.sin(this.angle)*a;
        }
        else {
            this.ay = 0;
            this.ax = 0;
        }

        // rotation
        if (pressed[keys.LEFT]) {
            this.rot = SHIP.leftRotate;
        }
        else if (pressed[keys.RIGHT]) {
            this.rot = SHIP.rightRotate;
        }
        else {
            this.rot = SHIP.noRotate;
        }

        // thrusting
        if (SHIP.permanentThrust) {
            this.thruster = true;
        }
        else {
            if (pressed[keys.THRUST]) {
                this.thruster = true;
            }
            else {
                this.thruster = false;
            }
        }

        // shooting
        if (pressed[keys.FIRE]) {
            this.fired = true;
        }
        else {
            this.fired = false;
        }
    };

    this.update = function(dt) {

        var vmax, asize;

        this.vx = this.vx + this.ax*dt - SHIP.gamma*this.vx*dt;
        this.vy = this.vy + this.ay*dt - SHIP.gamma*this.vy*dt;

        if (this.thruster) {
            vmax = SHIP.vmax;
        }
        else {
            vmax = SHIP.vmax;
        }

        // cap the speed
        if (this.vx > vmax) {
            this.vx = vmax;
        }
        else if (this.vx < -vmax) {
            this.vx = -vmax;
        }
        if (this.vy > vmax) {
            this.vy = vmax;
        }
        else if (this.vy < -vmax) {
            this.vy = -vmax;
        }

        this.x = this.x + this.vx*dt;
        this.y = this.y + this.vy*dt;

        // update angle
        if (this.rot === SHIP.leftRotate) {
            this.angle = this.angle - dt*SHIP.rotv;
            }
        else if (this.rot === SHIP.rightRotate) {
            this.angle = this.angle + dt*SHIP.rotv;
        }

        // create bullet if fired
        BULLET.tSince += dt;
        if (this.fired) {
            if (BULLET.tSince > BULLET.coolDown) {
                // play soundeffect
                JUKE.jukebox.playSfx('laser' + this.num);
                GM.addBullet(this.num, new Bullet(this.num, this.x + this.hwidth, 
                                        this.y + this.hheight, this.angle));
                BULLET.tSince = 0;
            }
        }

        // check for collision with arena walls: we make the velocity
        // in the direction of the wall zero, since otherwise we
        // 'stick' to the wall.  An alternative is reversing the
        // velocity (this.vx = -this.vx, etc.), but it seems like this
        // would change the game quite a lot.
        asize = GLOBALS.arenaSize;
        if (this.x < asize.xmin) {
            this.x = asize.xmin;
            this.vx = 0;
        }
        else if (this.x > asize.xmax - this.width) {
            this.x = asize.xmax - this.width;
            this.vx = 0;
        }
        if (this.y < asize.ymin) {
            this.y = asize.ymin;
            this.vy = 0;
        }
        else if (this.y > asize.ymax - this.height) {
            this.y = asize.ymax - this.height;
            this.vy = 0;
        }

        // check if we have hit one of the obstacles in the arena
        // (again ignore bullet size).
        var asize = GLOBALS.arenaSize;
        var rects = GLOBALS.arenaRects;
        var i, r, rl, offx, offy, side;
        rl = rects.length;
        for (i = 0; i < rl; ++i) {
            r = rects[i];
            if (this.x + this.width > r.x && this.x < r.x + r.width &&
                this.y + this.height > r.y && this.y < r.y + r.height) {

                // did we hit it from the side (left or right direction)?
                side = (this.y + this.hheight > r.y && this.y + this.hheight < r.y + r.height)

                if (side) {
                    offy = 0;
                    this.vx = 0;
                    if (this.x > r.x) {
                        // hit from the right
                        offx = (r.x + r.width) - this.x;
                    }
                    else {
                        // hit from the left
                        offx = - (this.x + this.width - r.x);
                    }
                }
                else {
                    offx = 0;
                    this.vy = 0;
                    if (this.y < r.y) {
                        // hit from top
                        offy = r.y - (this.y + this.height);
                    }
                    else {
                        // hit from bottom
                        offy = r.y + r.height - this.y;
                    }
                }

                this.x = this.x + offx;
                this.y = this.y + offy;

            }
        }

        // reduce health
        this.health = this.health - SHIP.decaySpeed*dt;

        var tleft = this.health / SHIP.decaySpeed;
        if (tleft < 5) {
            JUKE.jukebox.playSfx('alarm');
            this.flashing = true;
            this.flasht += dt;
            this.flasht = this.flasht % 0.2;
            if (this.flasht < 0.1) {
                this.alpha = 0.1;
            }
            else {
                this.alpha = 1;
            }
        }

        if (this.health < 0.5) {
            this.dead = true
        }
    };
};
