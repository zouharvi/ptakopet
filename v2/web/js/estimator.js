function estimator_ready() {
    // throtle input
    estimator.estimate_translation_1 = function () {
        clearTimeout(estimator.estimation_1_timer);
        estimator.estimation_1_timer = setTimeout(estimator.real.estimate_translation_1, 1000);
    }
    estimator.real = {};

    estimator.real.estimate_translation_1 = function() {
        let text_source = input_source.val();
        let text_target = input_target.val();

        // blank input event at the beginning
        if(text_source.length == 0 || text_target.length == 0)
            return;

        console.log('starting QE');

        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:8080",
            data: {
                source: text_source,
                target: text_target,
            },
            success: function (data) {
                try {
                    data = JSON.parse(data);
                    estimator.color(data, input_target);
                } catch(e) {
                    console.log("QE Error");
                    console.log(e);
                }
            }
        });
    }
    
    estimator.color = function(estimation, target) {
        let indexes = Utils.get_word_index(target.val());
        let perm = Utils.sorting_permutation(estimation);

        let highlights = [];
        for (let i = 0; i < perm.length; i++) {
            if(perm[i] == perm.length-1) {
                highlights.push({highlight: indexes[i], className: 'word_highlight_1'});
            }
        }
        target.highlightWithinTextarea({highlight: highlights});
    };
}