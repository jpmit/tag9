// ai.js
// Copyright (c) James Mithen 2014.
// AI for single player mode

'use strict';

/*global GMSTATE*/
/*global GM*/

var AI = (function () {
    // callbacks for state processing
    var START = 'start',
        HUNT = 'hunt',
        STUCK = 'stuck', // stuck against arena
        RUN = 'run',
        VICTORY = 'victory',
        procState = {},
        dataState = {},
        state; // current state

    function reset() {
        state = START;
        dataState[START] = {};
        dataState[STUCK] = {};
        dataState[HUNT] = {};
        dataState[RUN] = {};
        dataState[VICTORY] = {};
    }

    // the actual AI logic
    function getPressed(ship) {
        var keys = ship.keys,
            enemy = GM.getShip(1),
            pressed = {};

        if (GMSTATE.isDead) {
            state = VICTORY;
        }

        //console.log(state);

        // get pressed for the state
        pressed = procState[state](keys, ship, enemy, dataState[state]);
        return pressed;
    }

    // return pressed keys object for a random direction: either down
    // + right, up + right, down + left, up + left.
    function pressedRandomDirection(keys) {
        var r = Math.random(),
            pressed = {};
        if (r < 0.25) {
            pressed[keys.DOWN] = true;
            pressed[keys.RIGHT] = true;
        } else if (r < 0.5) {
            pressed[keys.UP] = true;
            pressed[keys.RIGHT] = true;
        } else if (r < 0.75) {
            pressed[keys.DOWN] = true;
            pressed[keys.LEFT] = true;
        } else {
            pressed[keys.UP] = true;
            pressed[keys.LEFT] = true;
        }
        return pressed;
    }

    function checkIfStuck(ship, data) {
        var buflen = 20, // for storing previous positions
            stuckDistance = 4, // in pixels
            blen,
            i,
            p,
            minx,
            maxx,
            miny,
            maxy;

        // position buffer for most recent positions tells us if we are 'stuck'
        if (!data.posbuffer) {
            data.posbuffer = [[ship.x, ship.y]];
        } else {
            data.posbuffer.push([ship.x, ship.y]);
            blen = data.posbuffer.length;
            if (blen > buflen) {
                data.posbuffer.splice(0, 1);
                blen -= 1;
                // work out if we are stuck
                minx = maxx = data.posbuffer[0][0];
                miny = maxy = data.posbuffer[0][1];
                for (i = 1; i < blen; i += 1) {
                    p = data.posbuffer[i];
                    if (p[0] < minx) {
                        minx = p[0];
                    } else if (p[0] > maxx) {
                        maxx = p[0];
                    }
                    if (p[1] < miny) {
                        miny = p[1];
                    } else if (p[1] > maxy) {
                        maxy = p[1];
                    }
                }
                if ((maxx - minx < stuckDistance) && (maxy - miny < stuckDistance)) {
                    //console.log('stuck', minx, maxx, miny, maxy);
                    return true;
                }
            }
        }
        return false;
    }

    function canSeeEnemy(ship, enemy) {
        var gradient,
            intercept,
            rects = GMSTATE.arenaRects,
            rl = rects.length,
            r,
            i,
            yleft,
            yright,
            xbottom,
            xtop;
        gradient = (enemy.y - ship.y) / (enemy.x - ship.x);
        intercept = ship.y - gradient * ship.x;

        // check if the line y = intercept + gradient*y intersects any
        // of the arena rects
        for (i = 0; i < rl; i += 1) {
            r = rects[i];
            // is the rectangle between us?
            if ((ship.x < r.x && enemy.x > r.x) ||
                    (enemy.x < r.x && ship.x > r.x) ||
                    (ship.y < r.y && enemy.y > r.y) ||
                    (enemy.y < r.y && ship.y > r.y)) {
                yleft = intercept + r.x * gradient;
                yright = intercept + (r.x + r.width) * gradient;
                if ((yleft > r.y && yleft < r.y + r.height) ||
                        (yright > r.y && yright < r.y + r.height)) {
                    return false;
                }
                xtop = (r.y - intercept) / gradient;
                xbottom = (r.y + r.height - intercept) / gradient;
                if ((xtop > r.x && xtop < r.x + r.width) ||
                        (xbottom > r.x && xbottom < r.x + r.width)) {
                    return false;
                }
            }
        }
        return true;
    }

    /*jslint unparam: true*/
    function pressedStart(keys, ship, data) {
        var gtime = GMSTATE.gameTime,
            pressed = {};

        if (!data.route) {
            // generate a random start time for movement
            data.startTime = 0.3 * Math.random() + 0.05;
            // either go up or right out of the box
            if (Math.random() < 0.5) {
                data.route = 'up';
            } else {
                data.route = 'down';
            }
            // random data for a non-deterministic trajectory
            data.r1 = Math.random();
            data.r2 = Math.random();
            data.r3 = Math.random();
        }

        if (data.route === 'up') {
            if (gtime > data.startTime && gtime < 0.5 * data.r1 + 0.4) {
                pressed[keys.LEFT] = true;
            } else if (gtime > 1.0 && gtime < 2.0) {
                pressed[keys.RIGHT] = true;
            }
            if (gtime > 0.5 && gtime < 1.2) {
                pressed[keys.UP] = true;
            }
            if (gtime > 1.2) {
                if (data.r2 > 0.5) {
                    pressed[keys.UP] = true;
                }
            }
        } else if (data.route === 'down') {
            if (gtime > data.startTime && gtime < 1.0) {
                pressed[keys.RIGHT] = true;
            } else if (gtime > 1.5 && gtime < 2.0) {
                pressed[keys.LEFT] = true;
            } else if (gtime < 2.5) {
                if (data.r2 > 0.3) {
                    pressed[keys.LEFT] = true;
                }
            }

            if (gtime > 0.5 && gtime < 2) {
                pressed[keys.UP] = true;
            } else if (gtime > 2) {
                if (data.r3 > 0.2) {
                    pressed[keys.UP] = true;
                }
            }
        }

        if (gtime > 3) {
            state = HUNT;
        }

        return pressed;
    }

    function pressedRun(keys, ship, enemy, data) {
        var r;

        if (checkIfStuck(ship, data)) {
            state = STUCK;
        } else if (ship.health < enemy.health + 10) {
            state = HUNT;
        }

        if (!data.pressed) {
            // log the time at which we started running in this
            // direction
            data.runTime = GMSTATE.gameTime;
            r = Math.random();
            data.pressed = {};
            if (r < 0.5) {
                data.pressedDirection = keys.RIGHT;
            } else {
                data.pressedDirection = keys.LEFT;
            }
            data.pressed[keys.UP] = true;
            data.pressed[data.pressedDirection] = true;
        } else {
            if (GMSTATE.gameTime > data.runTime + 4) {
                // go in a different direction
                data.pressed = undefined;
            } else if (GMSTATE.gameTime > data.runTime + 1) {
                // stop rotating (but keep going forwards)
                data.pressed[data.pressedDirection] = false;
            }
        }

        return data.pressed || {};
    }

    function pressedVictory(keys, ship, enemy) {
        var pressed = {};

        // random dance at the moment
        if (Math.random() < 0.7) {
            pressed[keys.UP] = true;
        }
        if (Math.random() < 0.7) {
            pressed[keys.LEFT] = true;
        }

        return pressed;
    }

    function pressedStuck(keys, ship, enemy, data) {
        if (!data.stuckTime) {
            // first time through
            data.stuckTime = GMSTATE.gameTime;
            data.stuckPressed = pressedRandomDirection(keys);
        }

        if (GMSTATE.gameTime > data.stuckTime + 1) {
            data.stuckTime = undefined;
            state = HUNT;
        }
        return data.stuckPressed;
    }

    function pressedHunt(keys, ship, enemy, data) {
        var eangle,
            eps = 0.2, // to stop 'shuddering'
            angle,
            pressed = {};

        // check if we are 'stuck' against an obstacle
        if (checkIfStuck(ship, data)) {
            state = STUCK;
        }

        // run away if we are easily in the lead
        if (ship.health > enemy.health + 10) {
            state = RUN;
        }

        // angle between me and enemy
        eangle = Math.PI / 2 + Math.atan((enemy.y - ship.y) / (enemy.x - ship.x));

        if (ship.x > enemy.x) {
            eangle += Math.PI;
        }

        // angle taking my own rotation into account
        angle = eangle - ship.angle;
        if (angle < 0) {
            angle += 2 * Math.PI;
        }

        if (angle < Math.PI - eps) {
            pressed[keys.RIGHT] = true;
        } else if (angle > Math.PI + eps && angle < 2 * Math.PI - eps) {
            pressed[keys.LEFT] = true;
        }

        pressed[keys.UP] = true;
        if (!enemy.isDead) {
            // only shoot if we can see the enemy (the arena is not in
            // the way)
            if (canSeeEnemy(ship, enemy)) {
                pressed[keys.FIRE] = true;
                return pressed;
            }
        }

        return pressed;
    }


    // set callbacks for AI
    procState[START] = pressedStart;
    procState[HUNT] = pressedHunt;
    procState[STUCK] = pressedStuck;
    procState[RUN] = pressedRun;
    procState[VICTORY] = pressedVictory;

    return {getPressed: getPressed,
            reset: reset
           };
}());
