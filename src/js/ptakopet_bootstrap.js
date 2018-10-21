var browser = (typeof(browser) !== 'undefined') ? browser : 
              (typeof(chrome)  !== 'undefined') ? chrome  : {};

browser.browserAction.onClicked.addListener(function(tab) {
     chrome.tabs.executeScript(null, {file: "js/ptakopet_init.js"});
});

browser.contextMenus.create({
    title: "Ptakopět", 
    contexts:["all"], 
    onclick: function() { 
        chrome.tabs.executeScript(null, {file: "js/ptakopet_init.js"});
     }
  });