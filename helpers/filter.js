const _ = require('lodash');

const searchData = (data, searchString) => {
    return _.filter(data, (o) => {
        return o.question.toLowerCase().includes(searchString.toLowerCase()) || findInAnswers(o.answers, searchString);
    });
}

const findInAnswers = (data, searchString) => {
    let i = 0
    let includesData = false;
    do {
        includesData = data[i].toLowerCase().includes(searchString.toLowerCase());
        i++;
    } while (!includesData && i != data.length);
    return includesData;
}

module.exports = {
    searchData
}