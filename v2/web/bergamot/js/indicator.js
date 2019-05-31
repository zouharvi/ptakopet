function indicator_ready() {
    indicator.open_translation = 0;
    indicator.open_estimation = 0;
    
    indicator.open_translation_el = $('#open_indicator_translator');
    indicator.open_estimation_el = $('#open_indicator_estimator');

    indicator.translate = function(i) {
        indicator.open_translation += i;
        indicator.open_translation_el.text(indicator.open_translation);
    };

    indicator.estimate = function(i) {
        indicator.open_estimation += i;
        indicator.open_estimation_el.text(indicator.open_estimation);
    };
}