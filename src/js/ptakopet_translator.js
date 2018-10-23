var PTAKOPET_TRANSLATOR_LOADED = true;


function ptakopet_translator_ready() {
    ptakopet.translator = { engines: {}, lang_1: 'cs', lang_2: 'en' };
    // ptakopet.translator.selected_engine = "bojar_khresmoi";
    ptakopet.translator.selected_engine = "popel_lindat";

    ptakopet.translator.translate = function(s, callback, rev=false) {
        let engine = this.engines[this.selected_engine];
        if(rev) {
            let tmp = ptakopet.translator.lang_1;
            ptakopet.translator.lang_1 = ptakopet.translator.lang_2;
            ptakopet.translator.lang_2 = tmp;
        }
        let result = engine.translate(s, callback);
        if(rev) {
            let tmp = ptakopet.translator.lang_1;
            ptakopet.translator.lang_1 = ptakopet.translator.lang_2;
            ptakopet.translator.lang_2 = tmp;
        }
        return result;
    }

    ptakopet.translator.load_engine = function() {
        ptakopet.language_select_1.empty();
        ptakopet.language_select_2.empty();
        let engine = ptakopet.translator.engines[ptakopet.translator.selected_engine];
        for(let i in engine.languages) {
            let lang = engine.languages[i];
            ptakopet.language_select_1.append('<option value="' + lang + '">' + lang + '</option>')
            ptakopet.language_select_2.append('<option value="' + lang + '">' + lang + '</option>')
        }
        ptakopet.language_select_1.val(engine.languages[0]);
        ptakopet.language_select_2.val(engine.languages[1]);
    }
    
    ptakopet.translator.engines.bojar_khresmoi = {
        languages: ['cs', 'en'],
        name: 'Khresmoi',
        translate: function(s, callback) {
            $.ajax({
                type: "GET",
                url: "https://cors.io/?https://ufallab.ms.mff.cuni.cz/~bojar/mt/khresmoi.php?action=translate",
                data: {
                    sourceLang: ptakopet.translator.lang_1,
                    targetLang: ptakopet.translator.lang_2,
                    text: s
                },
                async: true,
                success: function(data) {
                    let res = JSON.parse(data);
                    if(res.errorCode == 0) {
                        let s = "";
                        for(i in res.translation) {
                            s += res.translation[i].translated[0].text + ' ';
                        }
                        callback(s);
                    }
                }
            });
        }
    }
    ptakopet.translator.engines.popel_lindat = {
        languages: ['cs', 'en'],
        name: 'Lindat',
        translate: function(s, callback) {
            $.ajax({
                type: "POST",
                url: "https://lindat.mff.cuni.cz/services/transformer/api/v1/models/" + ptakopet.translator.lang_1 + "-" + ptakopet.translator.lang_2,
                data: {
                    input_text: s,
                },
                async: true,
                success: function(data) {
                    // the response is not a valid JSON array (single instead of double quotes)
                    // bunch of more processing
                    callback(data.replace(/['"], ['"]/g, ' ').replace(/(\[['"]|[\\]*\\n['"]\])/g, '').replace(/\\n ?/g, "\n"));
                }
            });
        }
    }

}

function ptakopet_translator_strap() {
    for(let i in ptakopet.translator.engines) {
        let engine = ptakopet.translator.engines[i];
        ptakopet.engine_select.append('<option value="' + i + '">' + engine.name + '</option>')
    }

    // ptakopet.engine_select.attr('selected', ptakopet.translator.selected_engine);
    // $('#ptakopet_engine_select[value="' + '"]').prop('selected', true);
    ptakopet.engine_select.val(ptakopet.translator.selected_engine);

    ptakopet.engine_select.change(function() {
        ptakopet.translator.selected_engine = ptakopet.engine_select.val();
        ptakopet.translator.load_engine();
        ptakopet.ta1.trigger('input');
    });

    ptakopet.translator.load_engine();

}
