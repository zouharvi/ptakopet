function estimator_ready() {
    // throtle input
    estimator.estimate = function () {
        clearTimeout(estimator.timer);
        estimator.timer = setTimeout(estimator.active.estimate, 1000);
    }

    estimator.active = {};

    estimator.quest = {};
    estimator.quest.estimate = function () {
        let text_source = input_source.val();
        let text_target = input_target.val();
        
        // blank input event at the beginning
        if (text_source.length == 0 || text_target.length == 0)
        return;
        
        indicator.estimate(1);

        $.ajax({
            type: "POST",
            url: "http://quest.ms.mff.cuni.cz:80/zouharvi/",
            // url: "http://localhost:8080",
            data: {
                source: text_source,
                target: text_target,
            },
            success: function (data) {
                try {
                    data = JSON.parse(data);
                    estimator.color(data, input_target);
                } catch (e) {
                    console.log("QE Error");
                    console.log(e);
                }
                indicator.estimate(-1);
            }
        });
    }

    estimator.none = {};
    estimator.none.estimate = function () { input_target.highlightWithinTextarea({ highlight: [] }); };

    estimator.color = function (estimation, target) {
        let indexes = Utils.get_word_index(target.val());
        let perm = Utils.sorting_permutation(estimation);

        let highlights = [];
        for (let i = 0; i < perm.length; i++) {
            if (perm[i] <= 2) {
                highlights.push({ highlight: indexes[i], className: ('word_highlight_' + perm[i]) });
            }
        }
        target.highlightWithinTextarea({ highlight: highlights });
    };
}