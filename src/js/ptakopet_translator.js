var PTAKOPET_TRANSLATOR_LOADED = true;


function ptakopet_translator_ready() {
    ptakopet.translator = { engines: {} };
    // ptakopet.translator.selected_engine = "bojar_khresmoi";
    ptakopet.translator.selected_engine = "popel_lindat";

    ptakopet.translator.translate = function(s, callback) {
        let engine = this.engines[this.selected_engine];
        return engine.translate(s, callback);
    }
    
    ptakopet.translator.engines.bojar_khresmoi = {
        translate: function(s, callback) {
            $.ajax({
                type: "GET",
                url: "https://cors.io/?https://ufallab.ms.mff.cuni.cz/~bojar/mt/khresmoi.php?action=translate",
                data: {
                    sourceLang: 'en',
                    targetLang: 'cs',
                    text: s
                },
                async: true,
                success: function(data) {
                    let res = JSON.parse(data);
                    if(res.errorCode == 0) {
                        let s = "";
                        for(i in res.translation) {
                            s += res.translation[i].translated[0].text;
                        }
                        callback(s);
                    }
                }
            });
        }
    }
    ptakopet.translator.engines.popel_lindat = {
        translate: function(s, callback) {
            $.ajax({
                type: "POST",
                url: "https://lindat.mff.cuni.cz/services/transformer/api/v1/models/cs-en",
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