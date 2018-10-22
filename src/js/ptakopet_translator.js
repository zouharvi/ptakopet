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
    
    ptakopet.translator.engines.bojar_khresmoi = {
        translate: function(s, callback) {
            languages: ['cs', 'en'],
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