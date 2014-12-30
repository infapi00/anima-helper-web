// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
/*
 * Anima Helper Web
 *
 * Copyright (C) 2013 Alejandro Pineiro Iglesias <infapi00@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// in-game constants
var SURPRISE_THRESHOLD = 150;
var CRITIC_THROW_THRESHOLD = 90;
var INITIATIVE_CRITICAL_FAIL = [-125, -100, -75];

// Math section
var AnimahRollType = {
    NORMAL:0,
    INITIATIVE:1,
    RESISTANCE:2
};

function AnimahMath(params) {
    this._init(params);
}

AnimahMath.prototype = {

    _init: function(params) {
    },

    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // return [total, num_opened]
    getDiceRoll: function(rollType) {
        var open = 0;
        var diceRoll = 0;
        var total = 0;
        var threshold = CRITIC_THROW_THRESHOLD;
        var throwAgain = false;

        do {
            diceRoll = this.getRandomInt(1,100);

            switch (rollType) {
            case AnimahRollType.NORMAL:
            case AnimahRollType.INITIATIVE:
                if (diceRoll >= threshold) {
                    open++;
                    throwAgain = true;
                    if (threshold < 100) threshold++;
                } else {
                    throwAgain = false;
                }
                break;
            case AnimahRollType.RESISTANCE:
                throwAgain = false;
                break;
            }

            // critical fail

            if ((diceRoll < 4) && (open == 0)) {
                switch (rollType) {
                case AnimahRollType.NORMAL:
                    var criticalConfirmation = this.getRandomInt(1,100);
                    diceRoll = diceRoll - criticalConfirmation;
                    break;
                case AnimahRollType.INITIATIVE:
                    diceRoll = INITIATIVE_CRITICAL_FAIL [diceRoll - 1];
                    break;
                case AnimahRollType.RESISTANCE:
                    break;
                }
            }

            total += diceRoll;
        } while (throwAgain);

        return [total, open];
    }
};

