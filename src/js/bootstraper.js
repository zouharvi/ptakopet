// chrome supports chrome only
// IE supports browser only
// Firefox & Opera support both
var browser = browser || chrome;

var ptakopet = {};
if(browser.runtime) {
    ptakopet.getURL = browser.runtime.getURL; 
} else {
    // TODO: test this works only on ptakopet bootstraper
    ptakopet.getURL = function(str) { return str; }
}

$("html").append('<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet>');
$("html").append('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">');
$("html").append('<link rel="stylesheet" href="' + ptakopet.getURL("../css/floater.css") + '">');

// fetch floater.html content
$.ajax({
    url: ptakopet.getURL("../html/floater.html"),
    context: document.body
  }).done(function(data) {
    ptakopet.floater = $("html").append(data);
  });