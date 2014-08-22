// collide.js
// Copyright (c) James Mithen 2014.
// collision routines used in the game (note these are not the only
// collision functions used).

'use strict';

var COLL = (function () {
    /*global BULLET*/
    /*global GM*/
    /*global GMSTATE*/
    /*global JUKE*/

    var lastShipCollideTime = 0;
    // check for collision between Ship1 and Ship2 and adjust
    // velocities accordingly.  Note the collision physics is 'made
    // up' for simplicity (i.e. not a 'true' elastic / inelastic
    // collision).
    function collideShip(Ship1, Ship2) {
        if ((Ship1.x + Ship1.width > Ship2.x) && (Ship1.x < Ship2.x + Ship2.width)
                && (Ship1.y + Ship1.height > Ship2.y) && (Ship1.y < Ship2.y + Ship2.height)) {

            // stop the ships getting 'stuck' in a collision
            if (GMSTATE.gameTime < lastShipCollideTime + 0.8) {
                return;
            }

            // don't allow collision if one ship is dead
            if (GMSTATE.isDead) {
                return;
            }

            lastShipCollideTime = GMSTATE.gameTime;
            JUKE.jukebox.playSfx('shipcollide');

            if (((Ship1.vx > 0) && (Ship2.vx > 0)) || ((Ship1.vx < 0) && (Ship2.vx < 0))) {
                // same direction, reverse the velocity of whichever one going faster
                if (Ship1.vx > Ship2.vx) {
                    Ship1.vx = -Ship1.vx;
                } else {
                    Ship2.vx = -Ship2.vx;
                }
            } else {
                // different directions, reverse both velocities
                Ship1.vx = -Ship1.vx;
                Ship2.vx = -Ship2.vx;
            }

            if (((Ship1.vy > 0) && (Ship2.vy > 0)) || ((Ship1.vy < 0) && (Ship2.vy < 0))) {
                // same direction, reverse the velocity of whichever one going faster
                if (Ship1.vy > Ship2.vy) {
                    Ship1.vy = -Ship1.vy;
                } else {
                    Ship2.vy = -Ship2.vy;
                }
            } else {
                // different directions, reverse both velocities
                Ship1.vy = -Ship1.vy;
                Ship2.vy = -Ship2.vy;
            }
        }
    }

    // check for collision between Ship and bullets, take damage and
    // remove bullet accordingly.
    function collideBullets(Ship, bullets) {
        var i, bulletNum;
        bulletNum = (Ship.num === 1 ? 2 : 1);

        for (i = 0; i < bullets.length; i += 1) {
            if ((bullets[i].x > Ship.x) && (bullets[i].x < Ship.x + Ship.width)
                     && (bullets[i].y > Ship.y) && (bullets[i].y < Ship.y + Ship.height)) {
                JUKE.jukebox.playSfx('hit' + bulletNum);
                // reduce health of ship
                Ship.health -= BULLET.damage;
                GM.removeBullet(bulletNum, bullets[i]);
            }
        }
    }

    // public API
    return {collideShip: collideShip,
            collideBullets: collideBullets};
}());
