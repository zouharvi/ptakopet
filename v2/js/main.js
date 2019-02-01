let language_select_source = $('#language_select_source');
let language_select_target = $('#language_select_target');
let language_select_back = $('#language_select_back');
let input_source = $('#input_source');
let input_target = $('#input_target');
let input_back = $('#input_back');
let LANGUAGES = {'Czech': 'cs', 'English': 'en', 'French': 'fr', 'Hindi': 'hi'};
let translator = { lang_source: 'en', lang_target: 'fr' };

arch_ready();