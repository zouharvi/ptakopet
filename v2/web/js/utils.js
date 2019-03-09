let Utils = {};
Utils.get_word_index = function(text) {
    words = text.split(/[ ,\.\?]/);
    sum = 0;
    indicies = [];
    for(i in words) {
        indicies.push([sum, sum + words[i].length])
        sum += 1 + words[i].length;
    }
    return indicies;
}

Utils.sorting_permutation = function(test) {
    indexedTest = test.map(function(e,i){return {ind: i, val: e}});
    indexedTest.sort(function(x, y){return x.val > y.val ? 1 : x.val == y.val ? 0 : -1});
    return indexedTest.map(function(e){return e.ind});
}