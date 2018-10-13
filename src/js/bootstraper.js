// chrome supports chrome only
// IE supports browser only
// Firefox & Opera support both
var browser = browser || chrome;

var ptakopet = {
    position_left: typeof(localStorage.ptakopet_position_left)=="undefined"?true:localStorage.ptakopet_position_left=='true',
};
if(browser.runtime) {
    ptakopet.getURL = browser.runtime.getURL; 
} else {
    // TODO: test this works only on ptakopet bootstraper
    ptakopet.getURL = function(str) { console.log(str); return str; }
}

$("html").append('<link rel="stylesheet" href="' + ptakopet.getURL("../css/floater.css") + '">');

// fetch floater.html content
$.ajax({
    url: ptakopet.getURL("../html/floater.html"),
    context: document.body
  }).done(function(data) {
    $("html").append(data);
    ptakopet.floater = $('#ptakopet_floater')
    ptakopet.dir_button = $('#ptakopet_dir');
    ptakopet.ready();
  });

ptakopet.refresh_floater_pos = function() {
    // change the actuall position
    ptakopet.floater.css(ptakopet.position_left?'left':'right', '20px');
    ptakopet.floater.css(!ptakopet.position_left?'left':'right', '');

    // change the icon
    ptakopet.position_left?
        ptakopet.dir_button.attr('class', 'fa fa-arrow-right') :
        ptakopet.dir_button.attr('class', 'fa fa-arrow-left');
}

ptakopet.atrap_text_inputs = function() {
    $('input[type=text]').each(function(i, obj) {
        $(obj).hover(function(a, b) {
            console.log(this);
        })
        console.log(i);
    });
}

ptakopet.ready = function() {
    ptakopet.refresh_floater_pos();
    ptakopet.atrap_text_inputs();

    // bind top bar buttons
    $("#ptakopet_dir").click(function(e) {
        localStorage.ptakopet_position_left = ptakopet.position_left = !ptakopet.position_left;
        ptakopet.refresh_floater_pos();
    });

    $("#ptakopet_close").click(function(e) {
        console.log(ptakopet.floater.css('visibility'));
        ptakopet.floater.css('visibility', 'hidden');
    });

    // recalculate some html elements urls
    $('.extension_url_src').each(function(i, obj) {
        $(obj).attr('src', ptakopet.getURL($(obj).attr('src')));
    });
}
