let ptakopet_translator = {
    selected_engine : "bojar_khresmoi",
    engines : {},
}; 

ptakopet_translator.translate = function(s, callback) {
    let engine = engines[this.selected_engine];
    return engine.translate(s, callback);
}

let bojar_khresmoi = {
    translate: function(s, callback) {
        $.ajax({
            type: "GET",
            url: "http://ufallab.ms.mff.cuni.cz/~bojar/mt/khresmoi.php?action=translate&sourceLang=en&targetLang=cs&text=helllo+",
            async: false
        }).done(function(data) {
            console.log("DONE!" + data)
        });
    }
}

