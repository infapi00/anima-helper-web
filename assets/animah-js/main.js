// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
/*
 * Anima Helper Web
 *
 * Copyright (C) 2013 Alejandro Piñeiro Iglesias <infapi00@gmail.com>
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

// Players array, Name, Base, Random, Open, Total
var players = [ ["Lorenzo", 45, 0, 0, 0],
                ["Atanasio", 85, 0, 0, 0],
                ["Zenon", 115, 0, 0, 0],
                ["Fatima", 75, 0, 0, 0],
                ["Uriel", 70, 0, 0, 0]];

var playerTable;
var myMath = null;
var DEBUG = true;

//animah in-game constants
var SURPRISE_THRESHOLD = 150;
var CRITIC_THROW_THRESHOLD = 90;
var INITIATIVE_CRITICAL_FAIL = [-125, -100, -75];

function onDocumentReady() {

    /* Add a click handler for the delete row */
    $('#delete').click(function() {
	var anSelected = fnGetSelected(playerTable );
	if (anSelected.length !== 0) {
	    playerTable.fnDeleteRow(anSelected[0]);
	}
    } );

    playerTable = $('#player_table').dataTable({ 'bFilter': false,
                                                 'bInfo': false,
                                                 'bPaginate': false,
                                                 'aoColumns': [ null, {'sClass': 'center'}, {'sClass': 'center'}, {'sClass': 'center'}, {'sClass': 'center'}]
                                               } );

    myMath = new AnimahMath();
    updateTable();
}

/* Get the rows which are currently selected */
function fnGetSelected(oTableLocal)
{
    return oTableLocal.$('tr.row_selected');
}

function updateTable() {
    playerTable.fnClearTable();
    for (i = 0; i < players.length; i++) {
        players[i][4] = players[i][1] + players[i][2];
        playerTable.fnAddData(players[i]);
    }

    playerTable.$('tbody tr').click (function(e) {
        if ($(this).hasClass('row_selected')) {
	    $(this).removeClass('row_selected');
        }
        else {
	    playerTable.$('tr.row_selected').removeClass('row_selected');
	    $(this).addClass('row_selected');
        }
    });
}

// Callbacks to html elements
function onNewRound () {
    new_round ();
}

function onNewHit () {
    //FIXME: implement this
}

//FIXME: bad name and/or place

function new_round () {
    var diceRoll;

    for (i = 0; i < players.length; i++) {
        diceRoll = myMath.getDiceRoll (AnimahRollType.INITIATIVE);
        players[i][2] = diceRoll[0];
        players[i][3] = diceRoll[1];
    }

    updateTable();
}

// Math section
var AnimahRollType = {
    NORMAL:0,
    INITIATIVE:1,
    RESISTANCE:2
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function AnimahMath() {
}

// return [total, num_opened]
AnimahMath.prototype.getDiceRoll = function(rollType) {
    var open = 0;
    var diceRoll = 0;
    var total = 0;
    var threshold = CRITIC_THROW_THRESHOLD;
    var throwAgain = false;

    do {
        diceRoll = getRandomInt(1,100);

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
                var criticalConfirmation = getRandomInt(1,100);
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

//Aux methods
function log(message) {
    if (DEBUG) {
        console.log(message);
    }
}
