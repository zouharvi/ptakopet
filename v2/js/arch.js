function arch_ready() {
    language_select_source.change(function () {
        let new_lang = language_select_source.val();
        console.log(new_lang);

        // force back translation language
        language_select_back.val(new_lang);

        // swap languages if the same as target
        if (new_lang == translator.lang_target) {
            translator.lang_target = translator.lang_source;
            language_select_target.val(translator.lang_source);
        }
        translator.lang_source = new_lang;
        translate_target();
        translate_source();
    });

    language_select_target.change(function () {
        let new_lang = language_select_target.val();

        // swap languages if the same as source
        if (new_lang == translator.lang_source) {
            translator.lang_source = translator.lang_target;
            language_select_source.val(translator.lang_target);
            language_select_back.val(translator.lang_target);
        }
        translator.lang_target = new_lang;
        translate_target();
        translate_source();
    });

    // on input triggers
    input_source.on('input', function () {
        translate_source();
    });
    input_target.on('input', function () {
        translate_target();
    });

    // add available languages
    for (let k in LANGUAGES) {
        language_select_source.append($('<option>', {
            text: k,
            value: LANGUAGES[k]
        }));
        language_select_target.append($('<option>', {
            text: k,
            value: LANGUAGES[k]
        }));
        language_select_back.append($('<option>', {
            text: k,
            value: LANGUAGES[k]
        }));
    }
    // set default
    language_select_source.val('en');
    language_select_target.val('fr');
    language_select_back.val('en');
}