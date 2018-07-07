import $ from 'jquery';

// Range of  dashoffsets.
const RANGE = {
    max: 135.717,
    min: 340
};
const RANK_MAP = {
    person: {
        devision: 5,
        name: "Новичок",
        color: "#",
        acheave: {
            min: 0,
            max: 10
        }
    },

    knight: {
        devision: 4,
        name: "Рыцарь",
        color: "#3ac074",
        acheave: {
            min: 10,
            max: 100
        }
    },

    legend: {
        devision: 3,
        name: "Легенда",
        color: "#2c8ef2",
        acheave: {
            min: 100,
            max: 500
        }
    },

    lord: {
        devision: 2,
        name: "Властелин",
        color: "#19dbcb",
        acheave: {
            min: 500,
            max: 1500
        }
    },

    god: {
        devision: 1,
        name: "Божество",
        color: "#f7132b",
        acheave: {
            min: 1500,
            max: 2500
        }
    },

    custome: {
        devision: 0,
        name: "Батенька",
        color: "#fda82a",
        acheave: {
            min: 2500,
            max: 10000
        }
    }
};
const RANKS_NAMES = Object.keys(RANK_MAP).reduce((ranks, rank) => {
    ranks[rank] = rank;

    return ranks;
}, {});
const SELECTORS = {
    name: ".rankName_",
    gradient: ".raitingGradientColor_",
    border: ".raitingBorder_",
    raiting: ".userRaiting_"
};

const _baseOffset = (RANGE.min - RANGE.max) / Object.keys(RANK_MAP).length;

function Raiting({
    raiting,
    userId,
    selfUserRank
}) {
    this.rank = {};
    this.fillingBorderPercent = 0;

    this.selfUserRank = selfUserRank || false;
    this.userId = userId;
    this.targets = {
        $name: $(SELECTORS.name + userId),
        $border: $(SELECTORS.border + userId),
        $gradient: $(SELECTORS.gradient + userId),
        $raiting: $(SELECTORS.raiting + userId)
    };

    this.setRaiting(raiting);
}

Raiting.prototype.init = function () {
    this.setUserRank();
    this.setFillingBorderPercent();
};

Raiting.prototype.setRaiting = function (raiting) {
    this.raiting = raiting;
};

Raiting.prototype.setUserRank = function () {
    const {
        raiting
    } = this;
    let rankKey;
    const {
        legend,
        knight,
        person,
        lord,
        god,
        custome
    } = RANK_MAP;

    switch (true) {
        case raiting < person.acheave.max:
            rankKey = RANKS_NAMES.person;
            break;

        case raiting >= knight.acheave.min && raiting < knight.acheave.max:
            rankKey = RANKS_NAMES.knight;
            break;

        case raiting >= legend.acheave.min && raiting < legend.acheave.max:
            rankKey = RANKS_NAMES.legend
            break;

        case raiting >= lord.acheave.min && raiting < lord.acheave.max:
            rankKey = RANKS_NAMES.lord;
            break;

        case raiting >= god.acheave.min && raiting < god.acheave.max:
            rankKey = RANKS_NAMES.god;
            break;

        case raiting >= custome.acheave.min:
            rankKey = RANKS_NAMES.custome;
            break;
    }

    this.rank = RANK_MAP[rankKey];
};

Raiting.prototype.setFillingBorderPercent = function () {
    const {
        rank
    } = this;
    const devision = rank && rank.devision;

    if (devision) {
        this.fillingBorderPercent = RANGE.max + _baseOffset * devision;
    }
};

Raiting.prototype.decreaseRaiting = function (score) {
    this.raiting -= score;
};

Raiting.prototype.increaseRaiting = function (score) {
    this.raiting += score;
};

export default Raiting;