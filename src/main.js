alert("HEELO!");

// Avoid recursive frame insertion...
var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
if (!location.ancestorOrigins.contains(extensionOrigin)) {
    var iframe = document.createElement('iframe');
    // Must be declared at web_accessible_resources in manifest.json
    iframe.src = chrome.runtime.getURL('floater.html');

    // Some styles for a fancy sidebar
    iframe.style.cssText = 'position:fixed;top:0;left:0;display:block;' +
                           'width:300px;height:100%;z-index:1000;';
    document.body.appendChild(iframe);
}

