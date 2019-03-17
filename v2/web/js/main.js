// force HTTP because of Mixed Content policy
if (location.protocol == 'https:')
{
    location.href = 'http:' + window.location.href.substring(window.location.protocol.length);
}


let language_select_source = $('#language_select_source');
let language_select_target = $('#language_select_target');
let language_select_back = $('#language_select_back');
let input_source = $('#input_source');
let input_target = $('#input_target');
let input_back = $('#input_back');
let translator_backend = $('#translator_backend');
let estimator_backend = $('#estimator_backend');
let translator = { lang_source: 'en', lang_target: 'es' };
let estimator = {};
let indicator = {};

input_source.highlightWithinTextarea({highlight:[]})
input_target.highlightWithinTextarea({highlight:[]})
input_back.highlightWithinTextarea({highlight:[]})

translator_ready();
estimator_ready();
arch_ready();
indicator_ready();