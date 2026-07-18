chrome.runtime.onMessage.addListener((msg, sender, res) => {
  if (msg.action === 'open_tab') {
    chrome.tabs.create({
      url: msg.url,
      active: false
    });
  }
});
