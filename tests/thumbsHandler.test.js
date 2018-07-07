import expect from 'expect';
import $ from 'jquery'
import {
    thumbsHandler
} from '../src/thumbsHandler'

const $test = $('#test');

function test(describe, fn) {
    let errorMessage = false;
    const now = Date.now();

    try {
        fn();
    } catch (e) {
        errorMessage = '<strong>' + e.message + '</strong>';
    }

    const later = Date.now();
    const delta = later - now;
    const html = `
        <section class="testBlock">
            <h2 class="testBlock__title">${describe}</h2>
            <p>${errorMessage ?  
                '<span class="testBlock__failure">Тест не пройден: '+errorMessage+'</span>'
                : `<span class="testBlock__success">Тест пройден за ${delta}ms!</span>`}
            </p>
        </section>
    `;

    $test.append(html);
}

const thumbData = {
    postId: 6742,
    action: "like",
    isChoosen: false
};
const ACTIONS = {
    like: "like",
    dislike: "dislike"
};

test("Test to change thumb state.", function () {
    const $thumb = _createThumb();
    const $icon = $thumb.find("span");

    thumbsHandler._changeThumbState({
        $thumb,
        isChoosen: true,
        action: ACTIONS.like
    });

    const exptextedIconClass = "fa-thumbs-up";
    const isIconHasExpectedClass = $icon.hasClass(exptextedIconClass);
    const isThumbChoosen = $thumb.data("isChoosen");

    expect(isIconHasExpectedClass).toBeTruthy();
    expect(isThumbChoosen).toBeTruthy();
});

test("Test to get rating map.", function () {
    const commentId = 677642;
    const ratingMap = thumbsHandler.getRatingMap();

    expect(ratingMap).toBeA("object");
});

test("Test to create comment in the rating map if needed and get it.", function () {
    const commentId = 132435465768;

    thumbsHandler._createIfNeededAndGetComment(commentId);

    const ratingMap = thumbsHandler.getRatingMap();
    const commentRating = ratingMap[commentId];

    expect(commentRating.like).toEqual(0);
    expect(commentRating.dislike).toEqual(0);
});

test("Test to set comment's rating to rating map.", function () {
    const commentId = 67232142;
    const buttonParametrs = {
        isChoosen: true,
        action: ACTIONS.like,
        commentId
    };

    thumbsHandler._setRatingToMap(buttonParametrs);

    const ratingMap = thumbsHandler.getRatingMap();
    const commentRating = ratingMap[commentId];

    expect(commentRating.like).toEqual(1);
    expect(commentRating.dislike).toEqual(0);
});

test('Test to set default value for "dislike" rating in the rating map.', function () {
    const commentId = 3221223;

    const buttonParametrs = {
        isChoosen: true,
        action: ACTIONS.dislike,
        commentId
    };

    thumbsHandler._setRatingToMap(buttonParametrs);

    const ratingMap = thumbsHandler.getRatingMap();
    const commentRating = ratingMap[commentId];
    const beforeValue = 1;
    expect(commentRating.dislike).toEqual(beforeValue);

    thumbsHandler._setDefaultRating({
        commentId,
        type: ACTIONS.dislike
    });

    const expectedValue = 0;

    expect(commentRating.dislike).toEqual(expectedValue);
});

test("Test to show comment's like rating.", function () {
    const commentId = 677642;
    const $rating = $(`<span class="like-rating_${commentId}" hidden>`);
    $("body").append($rating);

    thumbsHandler._setRatingToMap({
        commentId,
        isChoosen: true,
        action: ACTIONS.like
    });

    thumbsHandler._showRatingOf({
        type: ACTIONS.like,
        commentId
    });

    const currentDosplayedRating = $rating.html();

    expect(currentDosplayedRating).toEqual(1);

    $rating.remove();
});

test("Test to get opposite action of the like action.", function () {
    const gottenAction = thumbsHandler._getOppositeActionOf(ACTIONS.like);

    expect(gottenAction).toEqual(ACTIONS.dislike);
});

test("Test to get opposite action of the dislike action.", function () {
    const gottenAction = thumbsHandler._getOppositeActionOf(ACTIONS.dislike);

    expect(gottenAction).toEqual(ACTIONS.like);
});

test('Test to get opposite thumb\'s data of "like" thumb.', function () {
    const commentId = 987654321;
    const $thumb = _createThumb(false, commentId);
    const $oppositeThumb = _createThumb(ACTIONS.dislike, commentId);
    const userAction = ACTIONS.like;

    $("body")
        .append($thumb)
        .append($oppositeThumb);

    const oppositeThumbData = thumbsHandler._getOppositeThumb({
        userAction,
        commentId
    });
    const isDislikeButtonHasId = oppositeThumbData.$target.hasClass(
        `dislikeButton_${commentId}`
    );

    expect(oppositeThumbData.action).toEqual(ACTIONS.dislike);
    expect(isDislikeButtonHasId).toBeTruthy();

    $oppositeThumb.remove();
    $thumb.remove();
});

function _createThumb(action, commentId) {
    const newThumbData = Object.create(thumbData);
    newThumbData.postId = commentId ? commentId : newThumbData.postId + 1;

    if (action) {
        newThumbData.action = action;
    }

    let buttonId;
    if (newThumbData.action === ACTIONS.dislike) {
        buttonId = "dislikeButton_" + newThumbData.postId;
    } else {
        buttonId = "likeButton_" + newThumbData.postId;
    }

    const $thumb = $(
        `<button hidden class="${buttonId}"><span></span></button>`
    );
    $thumb.data(newThumbData);

    return $thumb;
}