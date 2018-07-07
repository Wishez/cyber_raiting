import $ from 'jquery';

const _ = {};

_.isClasses = function (str, unwishedClasses) {
    return unwishedClasses.every(function (unwishedClass) {
        return new RegExp(unwishedClass, "ig").test(str);
    });
};

_.openUrl = function (e) {
    e.preventDefault();
    var href = e.target.href;

    if (href) {
        window.open(e.target.href);
    }
};

_.screwed = function (props) {
    var event = props.event ? props.event : "click";
    $(document).on(event, props.selector, props.callback);
};

export default _;