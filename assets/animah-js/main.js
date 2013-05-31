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

//animah math in-game constants
var SURPRISE_THRESHOLD = 150;
var CRITIC_THROW_THRESHOLD = 90;
var INITIATIVE_CRITICAL_FAIL = [-125, -100, -75];

// Globals
// Players array (contains instances of Player)
var players = new Array();
// Refence to the html table with the player information
var playerTable;
var myMath = null;
var DEBUG = true;
var DEBUG_TABLE = false;

// global variables
var editingMode = true;

// We don't set that on dataTable call, because we want to show all
//    the table in some cases
function updateTableVisibility() {
    if (DEBUG_TABLE) return;

    playerTable.fnSetColumnVis(0, false);
    playerTable.fnSetColumnVis(2, false);
    playerTable.fnSetColumnVis(3, false);
    playerTable.fnSetColumnVis(4, false);
}

function onDocumentReady() {
    myMath = new AnimahMath();

    initTable();
    updateElementsBasedOnSelectedPlayer();

    initEditPlayerForm();
}

function updateEditPlayerBasedOnFormValidity() {
    if ($('#player_form')[0].checkValidity()) {
        $('#invalid_data_warning').hide();
        $('#accept_edit_player').removeClass('ui-disabled');
    } else {
        $('#invalid_data_warning').show();
        $('#accept_edit_player').addClass('ui-disabled');
    }
}

function initEditPlayerForm() {

    $('#invalid_data_warning').hide();

    $('#base').bind('change', function(e){
        updateEditPlayerBasedOnFormValidity();
    });

    $('#modifier').bind('change', function(e){
        updateEditPlayerBasedOnFormValidity();
    });

    $('#damage').bind('change', function(e){
        updateEditPlayerBasedOnFormValidity();
    });
}


function fillTable() {
    // FIXME: creating some players by hand
    var atanasio = new Player({ name: "Atanasio",
                                base: 85 });
    var lorenzo = new Player({ name: "Lorenzo",
                               base: 45 });
    var fatima = new Player({ name: "Fatima",
                              base: 75 });

    players.push(atanasio);
    players.push(lorenzo);
    players.push(fatima);
}

function initTable() {
    playerTable = $('#player_table').dataTable({ 'bFilter': false,
                                                 'bInfo': false,
                                                 'bPaginate': false,
                                                 //Index, Name, Base, Random, Open, Total, Damage, Surprise
                                                 'aoColumns': [ null, null, {'sClass': 'center'}, {'sClass': 'center'},
                                                                {'sClass': 'center'}, {'sClass': 'center'}, {'sClass': 'center'}, null]
                                               } );
    updateTableVisibility();
    fillTable();
    updateTable();
}

function updateElementsBasedOnSelectedPlayer() {
    if (getSelectedPlayer() != null) {
        $('#remove_player').removeClass('ui-disabled');
        $('#edit_player').removeClass('ui-disabled');
        $('#new_hit').removeClass('ui-disabled');
    } else {
        $('#remove_player').addClass('ui-disabled');
        $('#edit_player').addClass('ui-disabled');
        $('#new_hit').addClass('ui-disabled');
    }
}

function updateTable() {
    playerTable.fnClearTable();
    for (i = 0; i < players.length; i++) {
        playerTable.fnAddData([i, players[i].name, players[i].base, players[i].diceRoll,
                               players[i].open, players[i].getTotalRoll(), players[i].damage,
                               players[i].surprise]);
    }

    playerTable.$('tbody tr').click (function(e) {
        if ($(this).hasClass('row_selected')) {
	    $(this).removeClass('row_selected');
        }
        else {
	    playerTable.$('tr.row_selected').removeClass('row_selected');
	    $(this).addClass('row_selected');
        }

        updateElementsBasedOnSelectedPlayer();
    });
}

// Callbacks to html elements
function onNewRound() {
    newRound();
}

function onNewHit() {
    debugLog ("Cleaning hit value");
    $("#hit_value").val("");
}

function onNewPlayer() {
    editingMode = false;
    cleanEditPlayerForm();
}

function onAcceptEditPlayer() {
    var name = $("#name").val();
    var base = parseInt($("#base").val());
    var modifier = parseInt($("#modifier").val());
    var damage = parseInt($("#damage").val());

    if (editingMode) {
        // FIXME: fill me!!
    } else { // So adding a player
        var newPlayer = new Player ({ name: name,
                                      base: base,
                                      modifier: modifier,
                                      damage: damage });

        debugLog("Adding player=("+name+","+base+","+modifier+","+damage+")");
        players.push(newPlayer);
    }

    updateTable();
}

function onHitPlayer() {
    player = getSelectedPlayer();

    if (player) {
        player.damage += parseInt($("#hit_value").val());
    }
    updateTable();
}

// Edit player form methods
function cleanEditPlayerForm() {
    $("#name").val("");
    $("#base").val("");
    $("#modifier").val("");
    $("#damage").val("");
}


//FIXME: bad name and/or place
function newRound () {
    for (i = 0; i < players.length; i++) {
        players[i].newRound();
    }

    updateTable();
}

/* Get the rows which are currently selected */
function fnGetSelected(oTableLocal)
{
    return oTableLocal.$('tr.row_selected');
}

function getSelectedPlayer() {
    var anSelected = fnGetSelected(playerTable);

    if (anSelected.length != 0) {
        var data = playerTable.fnGetData(anSelected[0]);
        var index = parseInt(data[0]);

        return players[index];
    }

    return null;
}

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

//Aux methods
function debugLog(message) {
    if (DEBUG) {
        console.log(message);
    }
}
