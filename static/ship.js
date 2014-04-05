// ship.js
// Ship (sic) and bullet logic.

var SHIP = {
    vmax: 200,  // maximum speed
    // if true, 'thruster' is always on
    permanentThrust: true,
    a: 20,
    aThrust: 100,
    gamma: 0.1,
    rotv: 3,
    noRotate: 0,
    leftRotate: -1,
    rightRotate: 1
};

var BULLET = {
    v: 500,
    coolDown: 0.2,
    tSince: 1000,
    // images for the different bullet types
    img: {}
};

// load bullet images
(function () {
    var img1 = new Image();
    var img2 = new Image();
    function onloadBullet(img, bulletNum) {
        BULLET.img[bulletNum] = img;
        // store half the width of the bullet and half the length
        BULLET.hwidth = img.width/2;
        BULLET.hheight = img.height/2;
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
        this.x = this.x + this.vx*dt;
        this.y = this.y + this.vy*dt;
    }
}

function Ship(pos, shipNum) {
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
        var vmax;

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
                GM.addBullet(new Bullet(this.num, this.x + this.hwidth, 
                                        this.y + this.hheight, this.angle));
                BULLET.tSince = 0;
            }
        }
        
    };
};

Ship.init = function(game) {
	 this.y = game.height / 2 - Const.PSIZE;
};

Ship.draw = function(ctx) {
	 ctx.fillStyle = Const.PCOL;
	 ctx.fillRect(this.x, this.y, Const.PSIZE, Const.PSIZE);
};
