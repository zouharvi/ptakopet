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
            url: (window.location.hostname == 'localhost')? "http://localhost:8080" : "http://quest.ms.mff.cuni.cz:80/zouharvi/",
            data: {
                request: 'quality_estimation',
                model: 'quest++',
                source: text_source,
                target: text_target,
                sourceLang: translator.lang_source,
                targetLang: translator.lang_target,
            },
            success: function (data) {
                indicator.estimate(-1);
                try {
                    data = JSON.parse(data)
                    estimator.color(data, input_target)
                    estimator.reverse_highlight(data)
                } catch (e) {
                    console.log(e);
                    console.log(data);
                }
            }
        });
    }

    estimator.reverse_highlight = function(estimation) {
        let text_source = input_source.val()
        let text_target = input_target.val()
        $.ajax({
            type: "POST",
            url: (window.location.hostname == 'localhost')? "http://localhost:8080" : "http://quest.ms.mff.cuni.cz:80/zouharvi/",
            data: {
                request: 'align',
                source: text_target,
                target: text_source,
            },
            success: function (data) {
                try {
                    tokens_source = Utils.tokenize(text_source)
                    tokens_target = Utils.tokenize(text_target)
                    
                    dataClean = data.split('"').join('')
                    parsed = dataClean.split(' ')
                    estimation_local = []
                    identical_words = []
                    for(let i in parsed) {
                        pair = parsed[i].split('-')
                        x = parseInt(pair[0])
                        y = parseInt(pair[1])
                        estimation_local.push(estimation[x])
                        if (tokens_target[x] == tokens_source[y]) {
                            identical_words.push(y)
                        }
                    }
                    console.log(tokens_source, tokens_target)
                    console.log(parsed)
                    estimator.color(estimation_local, input_source, identical_words)
                } catch (e) {
                    console.log(e)
                    console.log(data)
                }
            }
        });
    }

    estimator.none = {};
    estimator.none.estimate = function () { input_target.highlightWithinTextarea({ highlight: [] }); };

    estimator.color = function (estimation, target, underline=[]) {
        console.log(underline)
        let indicies = Utils.get_word_index(target.val());
        let highlights = [];
        for (let i in indicies) {
            let alpha = (Math.floor(255*(1.5*Math.abs(estimation[i]-0.6)))).toString(16)
            let color;
            if (underline.includes(parseInt(i))) {
                color = '#8844aa' + alpha
            } else {
                color = '#aa5555' + alpha
            }
            let style = 'style="background-color: ' + color + '; border-radius: 3px;"'
            highlights.push({ highlight: indicies[i], className: style });
        }
        target.highlightWithinTextarea({ highlight: highlights });
    };
}