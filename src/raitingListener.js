import $ from 'jquery';
import {
    timeout
} from './helpers'
import UserRaiting from './UserRaiting'
import viewRaitingHandler from './viewRaitingHandler'

const SELECTORS = {
    name: ".rankName_",
    gradient: ".raitingGradientColor_",
    border: ".raitingBorder_",
    users: ".userAvatar, [id*='postAvatar']",
    buttons: ".userEvaluationButton",
    currentUser: "#currentUserInfo",
    userPopup: '#userPopup',
    userEvaluationBlock: '#userPopupEvaluationBlock',
    userIdentity: '.userAvatar_'
};
const ACTIONS = {
    increase: "increase",
    decrease: "decrease"
};
const POPUP_USER_ID = "userPopup";
const userRaitingMap = {};

function listenForUserEvalution() {
    $(document).on("click", SELECTORS.buttons, _updateRaiting);
}

function _updateRaiting() {
    const $button = $(this);
    const {
        userId
    } = $button.closest('[data-user-id]').data();
    const {
        action,
        isAllowedEvaluate,
        isLikeButton
    } = $button.data();
    const {
        currentUserInfo
    } = $(SELECTORS.currentUser).data();
    const currentUserId = currentUserInfo.userId;
    const score = currentUserInfo.score;
    const isNotSelfEvaluation = userId !== currentUserId;

    if (isAllowedEvaluate && isNotSelfEvaluation) {
        // TODO сделать ajax request и обновить данные после успешного обновления.
        _changeUserRaiting({
            $button,
            action,
            isLikeButton,
            userId,
            currentUserId,
            score
        });
    }
}

function _changeUserRaiting({
    $button,
    action,
    userId,
    score
}) {
    const handler = _getRaitingHandlerFromMap(POPUP_USER_ID);
    const $evaluationUserBlock = $(SELECTORS.userEvaluationBlock);
    const totalEvaluatedScore = _getTotalEvaluatedScoreOf($evaluationUserBlock);
    const changeTotalEvaluationParameters = {
        $evaluationUserBlock,
        score,
        totalEvaluatedScore
    };

    switch (action) {
        case ACTIONS.increase:
            _increaseRaitingOf(handler, score);
            _increaseTotalEvaluatedScoreOf(
                changeTotalEvaluationParameters
            );
            break;

        case ACTIONS.decrease:
            _decreaseRaitingOf(handler, score);
            _decreaseTotalEvaluatedScoreOf(
                changeTotalEvaluationParameters
            );
            break;
    }

    const isSetRankName = false;
    _initViewOf(POPUP_USER_ID, isSetRankName);
    _setPreventingEvaluationIfNeeded({
        action,
        totalEvaluatedScore,
        score,
        $button
    });

    // Обновление пользователя за пределами попапа.
    const userRaitingHandler = _getRaitingHandlerFromMap(userId);
    const currentRaiting = handler.raiting;

    if (userRaitingHandler) {
        _syncMapOf({
            raiting: currentRaiting,
            userId,
            userRaitingHandler
        });
        _initViewOf(userId);
    }
    _updateUserInfoOf({
        raiting: currentRaiting,
        totalEvaluatedScore,
        userId
    });
}

function _getRaitingHandlerFromMap(userId) {
    return userRaitingMap[userId];
}

function _getTotalEvaluatedScoreOf($userEvaluation) {
    return $userEvaluation.data('totalEvaluatedScore');
}

function _increaseTotalEvaluatedScoreOf({
    $evaluationUserBlock,
    score,
    totalEvaluatedScore
}) {
    $evaluationUserBlock.data('totalEvaluatedScore', totalEvaluatedScore + score);
}

function _increaseRaitingOf(handler, score) {
    handler.increaseRaiting(score);
}

function _decreaseRaitingOf(handler, score) {
    handler.decreaseRaiting(score);
}

function _decreaseTotalEvaluatedScoreOf({
    $evaluationUserBlock,
    score,
    totalEvaluatedScore
}) {
    $evaluationUserBlock.data('totalEvaluatedScore', totalEvaluatedScore - score);
}

function _syncMapOf({
    userId,
    raiting,
    userRaitingHandler
}) {
    userRaitingHandler.setRaiting(raiting);
    _setUserRaitingToMap(userId, userRaitingHandler);
}

function _updateUserInfoOf({
    raiting,
    userId,
    totalEvaluatedScore
}) {
    const $users = $(`${SELECTORS.userIdentity}${userId}`);
    const currentUserInfo = $users.data('userInfo');
    currentUserInfo.rating = raiting;
    currentUserInfo.totalEvaluatedScore = totalEvaluatedScore;

    _setInfoFor($users, currentUserInfo);
}

function _setInfoFor($users, info) {
    $users.data('userInfo', info);
}

function _setPreventingEvaluationIfNeeded({
    action,
    score,
    totalEvaluatedScore,
    $button
}) {
    let isAllowedEvaluate = true;
    const maxScore = score * 10;
    let oppositeAction;

    switch (action) {
        case ACTIONS.increase:
            isAllowedEvaluate = totalEvaluatedScore < +maxScore;
            oppositeAction = ACTIONS.decrease;
            break;
        case ACTIONS.decrease:
            isAllowedEvaluate = totalEvaluatedScore > -maxScore;
            oppositeAction = ACTIONS.increase;
            break;
    }

    _setAllowedEvaluationOf({
        $button,
        isAllowedEvaluate
    });
    _allowEvaluationBy(oppositeAction);
}

function _setAllowedEvaluationOf({
    $button,
    isAllowedEvaluate
}) {
    $button
        .data('isAllowedEvaluate', isAllowedEvaluate)
        .prop('disabled', !isAllowedEvaluate);

}

function _allowEvaluationBy(action) {
    const $oppositeButton = $(`${SELECTORS.buttons}[data-action="${action}"]`);

    _setAllowedEvaluationOf({
        $button: $oppositeButton,
        isAllowedEvaluate: true
    });
}

function initUsersRaiting() {
    $(function () {
        console.log(SELECTORS.users)
        $(SELECTORS.users).each((index, user) => {
            const $user = $(user);
            if ($user.data('visible')) {
                const delay = index * 142;
    
                timeout(() => initSignleUserRaiting($user), delay)
            }
        });
    });
}

function initSignleUserRaiting($user, isSetRankName) {
    const {
        userInfo
    } = $user.data();

    if (userInfo) {
        const userId = userInfo.userId;
        const raiting = userInfo.rating;
        const selfUserRank = userInfo.selfUserRank;
        const userRaitingHandler = new UserRaiting({
            raiting,
            userId,
            selfUserRank
        });

        _setUserRaitingToMap(userId, userRaitingHandler);
        _initViewOf(userId, isSetRankName);
    }
}

function _setUserRaitingToMap(userId, raitingHandler) {
    userRaitingMap[userId] = raitingHandler;
}

function _initViewOf(userId, isSetRankName) {
    const userRaitingHandler = _getRaitingHandlerFromMap(userId);

    if (userRaitingHandler) {
        userRaitingHandler.init();

        _initBorderAndNameColorOf(userRaitingHandler);
        _initFillingBorderOf(userRaitingHandler);
        _initUserRaiting(userRaitingHandler);

        if (isSetRankName === void 0 || isSetRankName) {
            _initRankNameOf(userRaitingHandler);
        }
    }
}

function _initBorderAndNameColorOf(userRaitingHandler) {
    const { $name, $gradient } = userRaitingHandler.targets;
    const { rank } = userRaitingHandler;
    if (rank) {
        console.log(rank)
        const { color } = rank;
    
        viewRaitingHandler.setColorTo({
            $name,
            $gradient,
            color
        });
    }
}

function _initFillingBorderOf(userRaitingHandler) {
    const {
        $border
    } = userRaitingHandler.targets;
    const {
        fillingBorderPercent
    } = userRaitingHandler;

    viewRaitingHandler.fillBorderOn({
        $border,
        percent: fillingBorderPercent
    });
}

function _initRankNameOf(userRaitingHandler) {
    const { $name } = userRaitingHandler.targets;
    const { rank, selfUserRank } = userRaitingHandler;
    
    if (rank) {
        const { name  } = rank;
    
        viewRaitingHandler.setRankNameTo({
            $name,
            name: selfUserRank || name
        });
    }
}

function _initUserRaiting(userRaitingHandler) {
    const {
        $raiting
    } = userRaitingHandler.targets;
    const beforeRaiting = $raiting.html();
    const {
        raiting
    } = userRaitingHandler;

    viewRaitingHandler.showUserRaitingIn({
        $raiting,
        from: beforeRaiting,
        to: raiting
    });
}

export const raitingListener = {
    initUsers: initUsersRaiting,
    listen: listenForUserEvalution,
    initUser: initSignleUserRaiting,
    updateUserInfo: _updateUserInfoOf,
    getRaitingHandlerFromMap: _getRaitingHandlerFromMap,
    setUserRaitingToMap: _setUserRaitingToMap
};