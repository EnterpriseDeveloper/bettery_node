"use strict";
var trendingSorting = function (data) {
    var events = data.sort(function (x) { return x.answerAmount; });
    return events.reverse();
};
var controversialSorting = function (data) {
    for (var i = 0; i < data.length; i++) {
        var allQuantity = data[i].parcipiantAnswers == undefined ? 0 : data[i].parcipiantAnswers.length;
        // calcalate fomula
        data[i].controversial = (100 - allQuantity) / 100;
    }
    var events = data.sort(function (x) { return x.controversial; });
    return events;
};
module.exports = {
    trendingSorting: trendingSorting,
    controversialSorting: controversialSorting
};
