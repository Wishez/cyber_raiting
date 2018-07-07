import anime from 'animejs'

function setRankNameTo({
    $name,
    name
}) {
    $name.html(name);
}

function setColorTo({
    $name,
    $gradient,
    color
}) {
    $name.css("color", color);
    $gradient.attr("stop-color", color);
}

function fillBorderOn({
    $border,
    percent
}) {
    const borders = Array.from($border);

    anime({
        targets: borders,
        strokeDashoffset: percent,
        elasticity: 100,
        duration: 500,
        easing: "easeInOutCirc"
    });
}

function showUserRaitingIn({
    $raiting,
    from,
    to
}) {
    const raiting = {
        value: from
    };

    anime({
        targets: raiting,
        value: to,
        duration: 800,
        elasticity: 100,
        easing: "easeInOutCirc",

        run: function () {
            $raiting.html(Math.round(raiting.value));
        }
    });
}

const viewRaitingHandler = {
    setColorTo,
    fillBorderOn,
    setRankNameTo,
    showUserRaitingIn
};

export default viewRaitingHandler;