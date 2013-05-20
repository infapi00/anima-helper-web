// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

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

    clone: function(original) {
        clone = new Player;

        clone.name = name;//FIXME: should add a counter per name
        clone.base = clone.base;
        clone.modifier = 0;
        clone.damage = 0;

        return clone;
    }
}
