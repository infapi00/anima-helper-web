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

var player_table;
var myMath = null;
var DEBUG = true;

//animah in-game constants
var SURPRISE_THRESHOLD = 150;
var CRITIC_THROW_THRESHOLD = 90;
var INITIATIVE_CRITICAL_FAIL = [-125, -100, -75];

function onDocumentReady () {

    /* Add a click handler for the delete row */
    $('#delete').click( function() {
	var anSelected = fnGetSelected( player_table );
	if ( anSelected.length !== 0 ) {
	    player_table.fnDeleteRow( anSelected[0] );
	}
    } );

    player_table = $('#player_table').dataTable( { 'bFilter': false,
                                                   'bInfo': false,
                                                   'bPaginate': false,
                                                   'aoColumns': [ null, {'sClass': 'center'}, {'sClass': 'center'}, {'sClass': 'center'}, {'sClass': 'center'}]
                                                 } );

    myMath = new AnimahMath();
    updateTable ();
}

/* Get the rows which are currently selected */
function fnGetSelected( oTableLocal )
{
    return oTableLocal.$('tr.row_selected');
}

function updateTable () {
    player_table.fnClearTable();
    for (i = 0; i < players.length; i++) {
        players[i][4] = players[i][1] + players[i][2];
        player_table.fnAddData(players[i]);
    }

    player_table.$('tbody tr').click (function( e ) {
        if ( $(this).hasClass('row_selected') ) {
	    $(this).removeClass('row_selected');
        }
        else {
	    player_table.$('tr.row_selected').removeClass('row_selected');
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
    var dice_roll;

    for (i = 0; i < players.length; i++) {
        dice_roll = myMath.get_dice_roll (AnimahRollType.INITIATIVE);
        players[i][2] = dice_roll[0];
        players[i][3] = dice_roll[1];
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
AnimahMath.prototype.get_dice_roll = function(roll_type) {
    var open = 0;
    var dice_roll = 0;
    var total = 0;
    var threshold = CRITIC_THROW_THRESHOLD;
    var throw_again = false;

    do {
        dice_roll = getRandomInt(1,100);

        switch (roll_type) {
        case AnimahRollType.NORMAL:
        case AnimahRollType.INITIATIVE:
            if (dice_roll >= threshold) {
                open++;
                throw_again = true;
                if (threshold < 100) threshold++;
            } else {
                throw_again = false;
            }
            break;
        case AnimahRollType.RESISTANCE:
            throw_again = false;
            break;
        }

        // critical fail

        if ((dice_roll < 4) && (open == 0)) {
            switch (roll_type) {
            case AnimahRollType.NORMAL:
                var critical_confirmation = getRandomInt(1,100);
                dice_roll = dice_roll - critical_confirmation;
                break;
            case AnimahRollType.INITIATIVE:
                dice_roll = INITIATIVE_CRITICAL_FAIL [dice_roll - 1];
                break;
            case AnimahRollType.RESISTANCE:
                break;
            }
        }

        total += dice_roll;
    } while (throw_again);

    return [total, open];
}

// Tests

// mimic test2 on old anima helper
function onTest2() {
    test2 (100000);
}

function test_get_dice_roll (type, num_samples) {
    var total = 0;
    var max_value = 0;
    var min_value = 100;
    var samples = new Array();
    var num_opened = [0,0,0,0,0,0,0,0,0,0];
    var average_opened = new Array();
    var average = 0;
    var more_than_average = 0;
    var max_value_opened = 0;
    var variance = 0;

    myMath = new AnimahMath();

    for (i = 0; i < num_samples; i++) {
        dice_roll = myMath.get_dice_roll (type);

        if (dice_roll[0] > max_value) {
            max_value = dice_roll[0];
            max_value_opened = dice_roll[1];
        }
        if (dice_roll[0] < min_value)
            min_value = dice_roll[0];
        samples[i] = dice_roll[0];

        for (c = 0; c < 10; c++)
            if (dice_roll[1] > c)
                num_opened[c]++;

        total += dice_roll[0];
    }

    average = total / num_samples;
    for (c = 0; c < 10; c++)
        average_opened[c] = (num_opened[c]*100) / num_samples;

    /* we use this average to compute the variance and std variance */
    total = 0;
    for (i = 0; i < num_samples; i++)  {
        total += (samples[i] - average) * (samples[i] - average);
        if (samples[i] > average)
            more_than_average++;
    }
    variance = total / num_samples;
    more_than_average = (more_than_average * 100) / num_samples;

    log("AVERAGE: " + average);
    log("VARIANCE: " + variance);
    log("STD VARIANCE: " + Math.sqrt(variance));
    log("MINIMUM VALUE: " +  min_value);
    log("MAXIMUM VALUE: " + max_value + "(" + max_value_opened + ")");
    c = 0;
    while (num_opened[c] > 0) {
        log (" %% OPENED MORE THAT "+c+": "+average_opened[c]);
        c++;
    }
    log("%% GREATER THAN AVERAGE: "+more_than_average);
}

function test2 (num_samples) {
    log("NUM SAMPLES = "+num_samples);
    log("****************************************");
    log("ANIMA DATA FOR NORMAL");
    test_get_dice_roll (AnimahRollType.NORMAL, num_samples);
    log("****************************************");
    log("ANIMA DATA FOR INITIATIVE");
    test_get_dice_roll (AnimahRollType.INITIATIVE, num_samples);
    log("****************************************");
    log("ANIMA DATA FOR RESISTANCE");
    test_get_dice_roll (AnimahRollType.RESISTANCE, num_samples);
}
//Aux methods
function log(message) {
    if (DEBUG) {
        console.log(message);
    }
}
