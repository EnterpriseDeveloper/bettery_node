const _ = require('lodash');

const arrayUnique = (array) => {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

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
    arrayUnique,
    searchData
}