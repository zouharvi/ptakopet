var browser = (typeof(browser) !== 'undefined') ? browser : 
              (typeof(chrome)  !== 'undefined') ? chrome  : {};

function launch_trigger_ptakopet() {
    // todo: remap input triggers
    chrome.tabs.executeScript(null, {file: "js/ptakopet_init.js"});
}

browser.browserAction.onClicked.addListener(function(tab) {
    launch_trigger_ptakopet();
});

browser.contextMenus.create({
    title: "Ptakopět", 
    contexts:["all"], 
    onclick: function(aa) {
        console.log(aa); 
        launch_trigger_ptakopet();
     }
  });