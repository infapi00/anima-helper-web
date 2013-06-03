// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

//global hashtable
var namesUsed = {};

function Player(params) {
    this._init(params);
}

Player.prototype = {
    _init: function(params) {

        params = parse (params, { name: "",
                                  base: 0,
                                  modifier: 0,
                                  damage: 0,
                                  diceRoll: 0,
                                  open: 0,
                                });
        this.name = params.name;
        this.base = params.base;
        this.modifier = params.modifier;
        this.damage = params.damage;
        this.diceRoll = params.diceRoll;
        this.open = params.open;
        this.surprise = "";
    },

    newRound: function() {
        var localDiceRoll = myMath.getDiceRoll(AnimahRollType.INITIATIVE);
        this.diceRoll = localDiceRoll[0];
        this.open = localDiceRoll[1];
    },

    // Returns the total value of the initiative
    getTotalRoll: function() {
        return this.base + this.modifier + this.diceRoll;
    },

    _cloneName: function(name) {
        var value = 0;

        if (namesUsed[name])
            value = namesUsed[name];
        else
            value = 1;

        value++;
        namesUsed[name] = value;
        return name+value;
    },

    clone: function() {
        clone = new Player;

        clone.name = this._cloneName(this.name);
        clone.base = this.base;
        clone.modifier = 0;
        clone.damage = 0;

        return clone;
    },

    checkSurprise: function(defender) {
        return (this.getTotalRoll() - defender.getTotalRoll()) >= SURPRISE_THRESHOLD;
    },

    updateSurprise: function(players) {
        var i = 0;

        this.surprise = "";
        for (i = 0; i < players.length; i++) {
            if (this.checkSurprise(players[i]))
                this.surprise += players[i].name + " ";
        }
    },
}
