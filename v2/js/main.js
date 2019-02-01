let language_select_source = $('#language_select_source');
let language_select_target = $('#language_select_target');
let language_select_back = $('#language_select_back');
let input_source = $('#input_source');
let input_target = $('#input_target');
let input_back = $('#input_back');

let LANGUAGES = {'Czech': 'cs', 'English': 'en', 'French': 'fr', 'German': 'de'};

let translator = { lang_source: 'Czech', lang_target: 'English' };

language_select_source.change(function () {
    let new_lang = language_select_source.val();

    // force back translation language
    language_select_back.val(new_lang);

    // swap languages if the same as target
    if (new_lang == translator.lang_target) {
        translator.lang_target = translator.lang_source;
        language_select_target.val(translator.lang_source);
    }
    translator.lang_source = new_lang;

    translate_source();
});

language_select_target.change(function () {
    let new_lang = language_select_target.val();

    // swap languages if the same as source
    if (new_lang == translator.lang_source) {
        translator.lang_source = translator.lang_target;
        language_select_source.val(translator.lang_target);
        language_select_back.val(translator.lang_target);
        translator.lang_target = new_lang;
        translate_source();
    } else {
        translator.lang_target = new_lang;
        translate_target();
    }
});

// throtle input
let translate_source_timer;
function translate_source() {
    let text = input_source.val();
    clearTimeout(translate_source_timer);
    translate_source_timer = setTimeout(function () {
        $.ajax({
            type: "POST",
            url: "https://lindat.mff.cuni.cz/services/transformer/api/v1/models/" + LANGUAGES[translator.lang_source] + "-" + LANGUAGES[translator.lang_target],
            data: { input_text: text },
            async: true,
            success: function(data) {
                // the response is not a valid JSON array (single instead of double quotes)
                // bunch of more processing
                let data_clean = data.replace(/['"], ['"]/g, ' ').replace(/(\[['"]|[\\]*\\n['"]\])/g, '').replace(/\\n ?/g, "\n");
                input_target.val(data_clean == '[]' ? '' : data_clean);
                translate_target();
            }
        });
    }, 500);
}

input_source.on('input', function() {
    translate_source();
});


// throtle input
let translate_target_timer;
function translate_target() {
    let text = input_target.val();
    console.log('translating target')
    clearTimeout(translate_target_timer);
    translate_target_timer = setTimeout(function () {
        $.ajax({
            type: "POST",
            url: "https://lindat.mff.cuni.cz/services/transformer/api/v1/models/" + LANGUAGES[translator.lang_target] + "-" + LANGUAGES[translator.lang_source],
            data: { input_text: text },
            async: true,
            success: function(data) {
                // the response is not a valid JSON array (single instead of double quotes)
                // bunch of more processing
                let data_clean = data.replace(/['"], ['"]/g, ' ').replace(/(\[['"]|[\\]*\\n['"]\])/g, '').replace(/\\n ?/g, "\n");
                input_back.val(data_clean == '[]' ? '' : data_clean);
            }
        });
    }, 500);
}

input_target.on('input', function() {
    translate_target();
});