var browser = (typeof(browser) !== 'undefined') ? browser : 
              (typeof(chrome)  !== 'undefined') ? chrome  : {};

function launch_trigger_ptakopet(trText) {
    // browser.storage.local.set({
    //     PTAKOPET_TR_TEXT: (typeof(trText) == 'undefined'?'':trText) 
    // });
    browser.tabs.executeScript(null, {file: "js/ptakopet_init.js"});
}

browser.browserAction.onClicked.addListener(function(tab) {
    launch_trigger_ptakopet();
});

browser.contextMenus.create({
    title: "Ptakopět", 
    contexts:["all"], 
    onclick: function(contextData) {
        launch_trigger_ptakopet(contextData.selectionText);
     }
  });