"use strict";
var searchData = function (data, searchString) {
    return data.filter(function (o) {
        return o.question.toLowerCase().includes(searchString.toLowerCase()) || findInAnswers(o.answers, searchString);
    });
};
var findInAnswers = function (data, searchString) {
    var i = 0;
    var includesData = false;
    do {
        includesData = data[i].toLowerCase().includes(searchString.toLowerCase());
        i++;
    } while (!includesData && i != data.length);
    return includesData;
};
module.exports = {
    searchData: searchData
};
