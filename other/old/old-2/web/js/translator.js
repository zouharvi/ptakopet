function translator_ready() {
    // throtle input
    translator.translate_source = function () {
        clearTimeout(translator.source_timer);

        // blank input event at the beginning
        if (input_source.val().length == 0)
        return;

        translator.source_timer = setTimeout(translator.active.translate_source, 500);
    }

    // throtle input
    translator.translate_target = function () {
        clearTimeout(translator.target_timer);
        translator.target_timer = setTimeout(translator.active.translate_target, 500);
    }

    // MT Transformer
    translator.transformer = {
        LANGUAGES: { 'Czech': 'cs', 'English': 'en', 'French': 'fr', 'Hindi': 'hi' }
    };

    translator.transformer.translate_source = function () {
        let text = input_source.val();
        indicator.translate(1);
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
                input_target.trigger('input');
                // translator.translate_target();
                indicator.translate(-1);
            }
        });
    }

    translator.transformer.translate_target = function () {
        let text = input_target.val();
        indicator.translate(1);
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
                indicator.translate(-1);
            }
        });
    }

    // Khresmoi

    translator.khresmoi = {
        LANGUAGES: { 'Czech': 'cs', 'English': 'en', 'French': 'fr', 'German': 'de', 'Spanish': 'es' }
    };

    translator.khresmoi.translate_source = function () {
        let text = input_source.val();
        indicator.translate(1);
        $.ajax({
            type: "GET",
            url: "https://cors.io/?https://ufallab.ms.mff.cuni.cz/~bojar/mt/khresmoi.php?action=translate",
            data: {
                sourceLang: translator.lang_source,
                targetLang: translator.lang_target,
                text: text,
                alignmentInfo: true
            },
            success: function (data) {
                let res = JSON.parse(data);
                if (res.errorCode == 0) {
                    let text_all = '';
                    for (let i in res.translation) {
                        text_all += res.translation[i].translated[0].text + " ";
                    }
                    input_target.val(text_all);
                    input_target.trigger('input');
                }
                indicator.translate(-1);
            }
        });
    }

    translator.khresmoi.translate_target = function () {
        let text = input_target.val();
        indicator.translate(1);
        $.ajax({
            type: "GET",
            url: "https://cors.io/?https://ufallab.ms.mff.cuni.cz/~bojar/mt/khresmoi.php?action=translate",
            data: {
                targetLang: translator.lang_source,
                sourceLang: translator.lang_target,
                text: text,
                alignmentInfo: true
            },
            success: function (data) {
                let res = JSON.parse(data);
                if (res.errorCode == 0) {
                    let text_all = '';
                    for (let i in res.translation) {
                        text_all += res.translation[i].translated[0].text + " ";
                    }
                    input_back.val(text_all)
                }
                indicator.translate(-1);
            }
        });
    }

}