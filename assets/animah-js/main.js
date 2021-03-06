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

// Globals
// Players array (contains instances of Player)
var players = new Array();
// Refence to the html table with the player information
var playerTable;
var myMath = null;
var DEBUG = false;
var DEBUG_TABLE = false;

// global variables
var editingMode = true;

var AnimahTableData = {
    INDEX:0,
    NAME:1,
    BASE:2,
    MODIFIER:3,
    RANDOM:4,
    OPEN:5,
    TOTAL:6,
    DAMAGE:7,
    SURPRISE:8,
};

var tableVisibility = [false, true, false, false,
                       false, false, true, false,
                       true];

function updateTableVisibility() {
    var i = 0;

    //if we are debugging we want to see all the info
    if (DEBUG_TABLE) return;

    for (i = 0; i < tableVisibility.length; i++)
        playerTable.fnSetColumnVis(i, tableVisibility[i]);
}

function onDocumentReady() {
    myMath = new AnimahMath();

    initTable();
    updateElementsBasedOnSelectedPlayer();

    initEditPlayerForm();
    initHitPage();
}

function updateHitPlayerBasedOnFormValidity() {
    if ($('#hit_form')[0].checkValidity()) {
        $('#invalid_hit_warning').hide();
        $('#accept_hit_player').removeClass('ui-disabled');
    } else {
        $('#invalid_hit_warning').show();
        $('#accept_hit_player').addClass('ui-disabled');
    }
}

function initHitPage() {
    $('#invalid_hit_warning').hide();

    $('#hit_value').bind('keyup', function(e){
        updateHitPlayerBasedOnFormValidity();
    });
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

    $('#base').bind('keyup', function(e){
        updateEditPlayerBasedOnFormValidity();
    });

    $('#modifier').bind('keyup', function(e){
        updateEditPlayerBasedOnFormValidity();
    });

    $('#damage').bind('keyup', function(e){
        updateEditPlayerBasedOnFormValidity();
    });
}

function initTable() {
    playerTable =
        $('#player_table').dataTable({ 'bFilter': false,
                                       'bInfo': false,
                                       'bPaginate': false,
                                       //Index, Name, Base, Modifier, Random, Open, Total, Damage, Surprise
                                       'aoColumns': [ null, null,
                                                      {'sClass': 'center'},
                                                      {'sClass': 'center'},
                                                      {'sClass': 'center'},
                                                      {'sClass': 'center'},
                                                      {'sClass': 'center'},
                                                      {'sClass': 'center'}, null]
                                     } );
    updateTableVisibility();
    updateTable();
}

function updateElementsBasedOnSelectedPlayer() {
    if (getSelectedPlayer() != null) {
        $('#remove_player').removeClass('ui-disabled');
        $('#edit_player').removeClass('ui-disabled');
        $('#new_hit').removeClass('ui-disabled');
        $('#clone_player').removeClass('ui-disabled');
    } else {
        $('#remove_player').addClass('ui-disabled');
        $('#edit_player').addClass('ui-disabled');
        $('#new_hit').addClass('ui-disabled');
        $('#clone_player').addClass('ui-disabled');
    }

    if (players.length == 0) {
        $('#new_round').addClass('ui-disabled');
    } else {
        $('#new_round').removeClass('ui-disabled');
    }
}

function updateTable() {
    playerTable.fnClearTable();
    for (i = 0; i < players.length; i++) {
        playerTable.fnAddData([i, players[i].name, players[i].base, players[i].modifier,
                               players[i].diceRoll, players[i].open, players[i].getTotalRoll(),
                               players[i].damage, players[i].surprise]);
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

    playerTable.$('tbody tr').dblclick (function(e) {
        if ($(this).hasClass('row_selected')) {
	    $(this).removeClass('row_selected');
        }
        else {
	    playerTable.$('tr.row_selected').removeClass('row_selected');
	    $(this).addClass('row_selected');
        }

        var player = getSelectedPlayer();

        debugLog("Double clicked player "+player.name);

        onEditPlayer();
        $.mobile.changePage('#player')
    });

    updateElementsBasedOnSelectedPlayer();
}

// Callbacks to html elements
function onEditPlayer() {
    var player = getSelectedPlayer();

    editingMode = true;
    $('#player_header').text("Editing "+player.name);
    fillEditPlayerForm();
}

function onNewRound() {
    newRound();
}

function onChangeTable() {
    $('#checkbox-name').attr('checked', tableVisibility[AnimahTableData.NAME]);
    $('#checkbox-base').attr('checked', tableVisibility[AnimahTableData.BASE]);
    $('#checkbox-modifier').attr('checked', tableVisibility[AnimahTableData.MODIFIER]);
    $('#checkbox-diceRoll').attr('checked', tableVisibility[AnimahTableData.RANDOM]);
    $('#checkbox-open').attr('checked', tableVisibility[AnimahTableData.OPEN]);
    $('#checkbox-total').attr('checked', tableVisibility[AnimahTableData.TOTAL]);
    $('#checkbox-damage').attr('checked', tableVisibility[AnimahTableData.DAMAGE]);
    $('#checkbox-surprise').attr('checked', tableVisibility[AnimahTableData.SURPRISE]);

}

function onAcceptChangeTable() {

    tableVisibility[AnimahTableData.NAME] = $('#checkbox-name').is(':checked');
    tableVisibility[AnimahTableData.BASE] = $('#checkbox-base').is(':checked');
    tableVisibility[AnimahTableData.MODIFIER] = $('#checkbox-modifier').is(':checked');
    tableVisibility[AnimahTableData.RANDOM] = $('#checkbox-diceRoll').is(':checked');
    tableVisibility[AnimahTableData.OPEN] = $('#checkbox-open').is(':checked');
    tableVisibility[AnimahTableData.TOTAL] = $('#checkbox-total').is(':checked');
    tableVisibility[AnimahTableData.DAMAGE] = $('#checkbox-damage').is(':checked');
    tableVisibility[AnimahTableData.SURPRISE] = $('#checkbox-surprise').is(':checked');

    updateTableVisibility();
}

function onClonePlayer() {
    var original = getSelectedPlayer();
    debugLog("Cloning player " + original.name);

    players.push(original.clone());
    updateTable();
}

function onNewHit() {
    debugLog ("Cleaning hit value");
    $("#hit_value").val("0");
}

function onRemovePlayer() {
    var player = getSelectedPlayer();

    debugLog("Removing player "+player.name);

    $('#remove_label').text("Do you really want to remove player "+ player.name+"?");
}

function onAcceptRemovePlayer() {
    var index = getIndexSelectedPlayer();

    players.splice(index, 1);

    updateTable();
}

function onNewPlayer() {
    editingMode = false;
    cleanEditPlayerForm();
    $('#player_header').text("New player");
}

function onAcceptEditPlayer() {
    var player;
    var name = $("#name").val();
    var base = parseInt($("#base").val()) || 0;
    var modifier = parseInt($("#modifier").val()) || 0;
    var damage = parseInt($("#damage").val()) || 0;
    var previousTotal = 0;

    if (editingMode) {
        player = getSelectedPlayer();
        previousTotal = player.getTotalRoll();
    } else { // So adding a player
        player = new Player();
        debugLog("Adding player=("+name+","+base+","+modifier+","+damage+")");
        players.push(player);
    }

    player.name = name;
    player.base = base;
    player.modifier = modifier;
    player.damage = damage;

    if (previousTotal != player.getTotalRoll())
        updateAllSurprises();
    updateTable();
}

function onHitPlayer() {
    player = getSelectedPlayer();

    if (player) {
        player.damage += parseInt($("#hit_value").val()) || 0;
    }
    updateTable();
}


function fillEditPlayerForm() {
    player = getSelectedPlayer();

    $("#name").val(player.name);
    $("#base").val(player.base);
    $("#modifier").val(player.modifier);
    $("#damage").val(player.damage);
}

function cleanEditPlayerForm() {
    $("#name").val("");
    $("#base").val("");
    $("#modifier").val("");
    $("#damage").val("");
}

function updateAllSurprises() {
    for (i = 0; i < players.length; i++)
        players[i].updateSurprise(players);
}

function newRound () {
    var i = 0;

    for (i = 0; i < players.length; i++)
        players[i].newRound();

    updateAllSurprises();

    updateTable();
}

/* Get the rows which are currently selected */
function fnGetSelected(oTableLocal)
{
    return oTableLocal.$('tr.row_selected');
}

function getIndexSelectedPlayer() {
    var anSelected = fnGetSelected(playerTable);

    if (anSelected.length != 0) {
        var data = playerTable.fnGetData(anSelected[0]);
        var index = parseInt(data[0]);

        return index;
    }

    return -1;
}

function getSelectedPlayer() {
    var index = getIndexSelectedPlayer();

    if (index == -1)
        return null;
    else
        return players[index];
}

//Aux methods
function debugLog(message) {
    if (DEBUG) {
        console.log(message);
    }
}

function supressEnter(event) {
    if (event.keyCode == 13)
        return false;

    return true;
}
