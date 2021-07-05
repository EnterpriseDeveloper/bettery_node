"use strict";
var reputationConvert = function (n) {
    var num1 = n === undefined ? 0 : Number(n);
    var num2 = num1 < 0 ? (num1 * -1) : num1;
    var result = (Math.sqrt(8 * num2 + 1) - 1) / 2;
    if (n < 0) {
        return Math.ceil(result * -1);
    }
    else {
        return Math.floor(result);
    }
};
module.exports = reputationConvert;
