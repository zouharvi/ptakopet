var ptakopet = ptakopet || {};

function defer_loading(method) {
    if ((typeof $ !== "undefined") && (typeof PTAKOPET_ARCH_LOADED != 'undefined') && (typeof PTAKOPET_TRANSLATOR_LOADED != 'undefined'))
        method();
    else
        setTimeout(function() { defer_loading(method) }, 500);
}

defer_loading(function() {
    ptakopet_translator_ready();
    ptakopet_arch_ready();

    // finished loading
    ptakopet_arch_show();
});
