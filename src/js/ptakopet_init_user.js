var ptakopet = {};

function defer_jquery(method) {
    if (typeof($) != "undefined") method();
    else setTimeout(function() { defer_jquery(method) }, 500);
}

defer_jquery(function() {
    ptakopet_translator_ready();
    ptakopet_arch_ready();

    // finished loading
    ptakopet.floater.css("display", "block");
});
