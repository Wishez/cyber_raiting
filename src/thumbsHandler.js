import $ from 'jquery';
import _ from './underscore';

const SELECTORS = {
    thumbs: {
        all: ".userPostAction__button",
        // После нижнего подчёркивания должен быть идентификатор.
        dislike: ".dislikeButton_",
        like: ".likeButton_"
    },

    rating: {
        like: ".like-rating_",
        dislike: ".dislike-rating_"
    }
};
const ACTIONS = {
    like: "like",
    dislike: "dislike"
};
const ICONOGRAPHY = {
    [ACTIONS.like]: {
        true: "fa-thumbs-up",
        false: "fa-thumbs-o-up"
    },

    [ACTIONS.dislike]: {
        true: "fa-thumbs-down",
        false: "fa-thumbs-o-down"
    }
};
// [comment_id]:  {
//  like: 0,
//  dislike: 0
// }
const _ratingMap = {};

function init() {
    $(function () {
        _setDefaultStyleForThumbs();
        _registerListener();
    });
}

function _setDefaultStyleForThumbs() {
    $(SELECTORS.thumbs.all).each(_styleThumbIfNeeded);
}

function _styleThumbIfNeeded() {
    const $thumb = $(this);

    const thumbData = $thumb.data();
    const commentId = thumbData.postId;
    const isValidId = _validateId(commentId);
    const isNotInited = !thumbData.isInited;

    if (isValidId) {
        const $icon = $thumb.find("span");
        const action = thumbData.action;
        const isChoosen = thumbData.isChoosen;
        const isChoosenNow = isNotInited ? isChoosen : !isChoosen;
        const $choosenThumbs = $(`.${action}Button_${commentId}`);

        _changeThumbState({
            isChoosen: isChoosenNow,
            $thumb: $choosenThumbs,
            action
        });
        _setRatingToMap({
            isChoosen: isChoosenNow,
            action,
            commentId
        });
        _showCommentRating({
            action,
            commentId
        });

        if (isChoosenNow) {
            _setDefaultStateOfOppositeThumb({
                action,
                commentId
            });
        }

        if (isNotInited) {
            $thumb.data("isInited", true);
        }
    }
}

function _validateId(commentId) {
    const isCommentIdExtractedFromTemplate = !(
        typeof commentId === "string" && commentId.indexOf("{{") !== -1
    );

    return isCommentIdExtractedFromTemplate;
}

function _changeThumbState({
    $thumb,
    isChoosen,
    action
}) {
    $thumb.data("isChoosen", isChoosen).each(function () {
        const $icon = $(this).find("span");

        _changeIcon({
            $node: $icon,
            icon: ICONOGRAPHY[action][isChoosen]
        });
    });
}

function _setRatingToMap({
    isChoosen,
    action,
    commentId
}) {
    const commentRating = _createIfNeededAndGetComment(commentId);
    const oppositeAction = _getOppositeActionOf(action);
    const isCurrentOppositeActionHasValue = commentRating[oppositeAction];
    const isCurrentActionValue = commentRating[action];

    commentRating[action] = isChoosen ? 1 : isCurrentActionValue ? -1 : 0;
    commentRating[oppositeAction] =
        isChoosen && isCurrentOppositeActionHasValue ? -1 : 0;
}

function _createIfNeededAndGetComment(commentId) {
    const isNotCommentInMap = !(commentId in _ratingMap);

    if (isNotCommentInMap) {
        _ratingMap[commentId] = {
            [ACTIONS.like]: 0,
            [ACTIONS.dislike]: 0
        };
    }

    return _ratingMap[commentId];
}

function _getOppositeActionOf(currentAction) {
    const LIKE = ACTIONS.like;
    const DISLIKE = ACTIONS.dislike;
    let oppositeAction;

    switch (currentAction) {
        case LIKE:
            oppositeAction = DISLIKE;
            break;
        case DISLIKE:
            oppositeAction = LIKE;
            break;
    }

    return oppositeAction;
}

function _showCommentRating({
    userAction,
    commentId
}) {
    _showRatingOf({
        type: ACTIONS.like,
        commentId
    });
    _showRatingOf({
        type: ACTIONS.dislike,
        commentId
    });
}

function _showRatingOf({
    type,
    commentId
}) {
    const $rating = $(SELECTORS.rating[type] + commentId);
    const currentRating = $rating.html();
    const value = _ratingMap[commentId][type];

    $rating.html(Number(currentRating) + Number(value));
}

function _setDefaultStateOfOppositeThumb({
    action,
    commentId
}) {
    const oppositeThumbData = _getOppositeThumb({
        userAction: action,
        commentId
    });
    const $oppositeThumb = oppositeThumbData.$target;
    const oppositeAction = oppositeThumbData.action;

    _changeThumbState({
        isChoosen: false,
        $thumb: $oppositeThumb,
        action: oppositeAction
    });
    _setRatingToMap({
        isChoosen: false,
        action: action,
        commentId
    });
}

function _setDefaultRating({
    type,
    commentId
}) {
    _ratingMap[commentId][type] = 0;
}

function _getOppositeThumb({
    userAction,
    commentId
}) {
    let oppositeThumbAction = _getOppositeActionOf(userAction);

    const thumbSelector = SELECTORS.thumbs[oppositeThumbAction] + commentId;
    const $thumbButton = $(thumbSelector);

    return {
        action: oppositeThumbAction,
        $target: $thumbButton
    };
}

function _changeIcon({
    $node,
    icon
}) {
    $node.removeClass().addClass(`fa ${icon} font-size_18`);
}

function _registerListener() {
    _.screwed({
        selector: SELECTORS.thumbs.all,
        callback: _evaluateSomeUser
    });
}

function _evaluateSomeUser() {
    const {
        action,
        userId
    } = $(this).data();
    const userRaitingHandler = raitingListener.getRaitingHandlerFromMap(userId);

    if (userRaitingHandler) {
        const {
            raiting,
            totalEvaluatedScore
        } = userRaitingHandler;
        const updateRaitingParameters = {
            raiting,
            totalEvaluatedScore,
            userId
        };

        switch (action) {
            case ACTIONS.like:
                _increaseUserRaiting(updateRaitingParameters);
                break;

            case ACTIONS.dislike:
                _decreaseUserRaiting(updateRaitingParameters);
                break;
        }

        _initUserRaiting(userId);
    }

    _styleThumbIfNeeded.call(this);
}

function _increaseUserRaiting({
    raiting,
    totalEvaluatedScore,
    userId
}) {
    _updateUserInfo({
        raiting: raiting + 1,
        totalEvaluatedScore,
        userId
    });
}

function _updateUserInfo(properties) {
    raitingListener.updateUserInfo(properties);
}

function _decreaseUserRaiting({
    raiting,
    totalEvaluatedScore,
    userId
}) {
    _updateUserInfo({
        raiting: raiting - 1,
        totalEvaluatedScore,
        userId
    });
}

function _initUserRaiting(userId) {
    const $user = $(`.userAvatar_${userId}`);

    raitingListener.initUser($user);
}

function getRatingMap() {
    return _ratingMap;
}


export const thumbsHandler = {
    run: init,
    _changeThumbState,
    _showRatingOf,
    _getOppositeThumb,
    _setRatingToMap,
    _setDefaultStateOfOppositeThumb,
    _createIfNeededAndGetComment,
    _getOppositeActionOf,
    getRatingMap,
    _setDefaultRating
};;