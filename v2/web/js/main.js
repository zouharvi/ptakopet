let language_select_source = $('#language_select_source');
let language_select_target = $('#language_select_target');
let language_select_back = $('#language_select_back');
let input_source = $('#input_source');
let input_target = $('#input_target');
let input_back = $('#input_back');
let translator_backend = $('#translator_backend');
let translator = { lang_source: 'en', lang_target: 'fr' };
let estimator = {};

input_source.highlightWithinTextarea({highlight:[]})
input_target.highlightWithinTextarea({highlight:[]})
input_back.highlightWithinTextarea({highlight:[]})

translator_ready();
estimator_ready();
arch_ready();