var ptakopet = ptakopet || {};
ptakopet.translator = {};
ptakopet.translator.selected_engine = "bojar_khresmoi";
ptakopet.translator.engines = {};

function ptakopet_translator_ready() {
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
                async: true
            }).done(function(data) {
                let res = JSON.parse(data);
                if(res.errorCode == 0) {
                    let s = "";
                    for(i in res.translation) {
                        s += res.translation[i].translated[0].text;
                    }
                    console.log("handling to callback: " + s);
                    callback(s);
                }
                // console.log(data);
            });
        }
    }
}