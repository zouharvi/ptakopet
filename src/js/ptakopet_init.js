// chrome supports chrome only
// IE supports browser only
// Firefox & Opera support both
var browser = browser || chrome;    
// TODO: save browser.runtime.getURL

function jquery_ready(){
    // fetch floater.html content
    // rewrite this using plaing XHR request
    $.ajax({
        url: browser.runtime.getURL("../html/floater.html"),
        context: document.body
    }).done(function(data) {
        $("html").append(data);

        // move this to html <script> (containing jquery defer)
        if(typeof(browser.runtime) != 'undefined') {
            // recalculate some html elements urls
            $('.extension_url_src').each(function(i, obj) {
                console.log($(obj));
                // special handling of script tags
                if($(obj).is('script')) {
                    let script = document.createElement("script");
                    script.src = browser.runtime.getURL($(obj).attr('p_src'));
                    $("html").append(script);
    
                    $(obj).remove();
                } else {
                    $(obj).attr('src', browser.runtime.getURL($(obj).attr('p_src')));
                }
            });
            // get rid of all processed script tags (they )
            $('script.extension_url_src').remove();
        }
    });
} 
