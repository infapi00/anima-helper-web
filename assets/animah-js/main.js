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

// Players array, Name, Base, Random, Total
var players = [ ["Pepe", 45, 0],
                ["Manolo", 85, 0]];

var player_table = null;
var myMath = null;

function onDocumentReady () {
    player_table = $('#player_table').dataTable( { 'bFilter': false,
                                                   'bInfo': false,
                                                   'bPaginate': false,
                                                   'aoColumns': [ null, {'sClass': 'center'}, {'sClass': 'center'}, {'sClass': 'center'}]
                                                 } );
    myMath = new AnimahMath();
    new_round ();
}

function updateTable () {
    player_table.fnClearTable();
    for (i = 0; i < players.length; i++) {
        player_table.fnAddData(players[i]);
    }
}

function onNewRound () {
    new_round ();
}
//FIXME: bad name and/or place

function new_round () {

    for (i = 0; i < players.length; i++) {
        players[i][2] = myMath.get_dice_roll ();
        players[i][3] = players[i][1] + players[i][2];
    }

    updateTable();
}

// Math section
function AnimahMath() {
}

AnimahMath.prototype.get_dice_roll = function(roll_type) {
    return Math.floor((Math.random()*100)+1)
};
