browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "on") {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      browser.tabs.sendMessage(tabs[0].id, { action: "load" });
    });
  } else if (request.action === "removeElements") {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      browser.tabs.sendMessage(tabs[0].id, { action: "removeElements" });
    });
  }
});