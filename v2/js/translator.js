// throtle input
let translate_source_timer;
function translate_source() {
    let text = input_source.val();
    clearTimeout(translate_source_timer);
    translate_source_timer = setTimeout(function () {
        $.ajax({
            type: "POST",
            url: "https://lindat.mff.cuni.cz/services/transformer/api/v1/languages?src=" + translator.lang_source + "&tgt=" + translator.lang_target,
            data: { input_text: text },
            async: true,
            success: function (data) {
                // the response is not a valid JSON array (single instead of double quotes)
                // bunch of more processing
                let data_clean = data.replace(/['"], ['"]/g, ' ').replace(/(\[['"]|[\\]*\\n['"]\])/g, '').replace(/\\n ?/g, "\n");
                input_target.val(data_clean == '[]' ? '' : data_clean);
                translate_target();
            }
        });
    }, 500);
}


// throtle input
let translate_target_timer;
function translate_target() {
    let text = input_target.val();
    console.log('translating target')
    clearTimeout(translate_target_timer);
    translate_target_timer = setTimeout(function () {
        $.ajax({
            type: "POST",
            url: "https://lindat.mff.cuni.cz/services/transformer/api/v1/languages?src=" + translator.lang_target + "&tgt=" + translator.lang_source,
            data: { input_text: text },
            async: true,
            success: function (data) {
                // the response is not a valid JSON array (single instead of double quotes)
                // bunch of more processing
                let data_clean = data.replace(/['"], ['"]/g, ' ').replace(/(\[['"]|[\\]*\\n['"]\])/g, '').replace(/\\n ?/g, "\n");
                input_back.val(data_clean == '[]' ? '' : data_clean);
            }
        });
    }, 500);
}