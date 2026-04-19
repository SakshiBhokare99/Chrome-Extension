let currentTab = null;
let startTime = Date.now();

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed");
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    trackPreviousTab();

    const tab = await chrome.tabs.get(activeInfo.tabId);
    currentTab = tab;
    startTime = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.status === "complete") {
        trackPreviousTab();
        currentTab = tab;
        startTime = Date.now();
    }
});

function trackPreviousTab() {
    if (!currentTab || !currentTab.url) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    if (timeSpent <= 1) return;

    const logData = {
        userId: "123",
        logs: [
            {
                url: currentTab.url,
                timeSpent: timeSpent,
                date: new Date()
            }
        ]
    };

    console.log("Tracking:", logData);

    fetch("http://localhost:3000/api/logs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(logData)
    })
    .then(res => res.json())
    .then(data => console.log("Saved:", data))
    .catch(err => console.error("Error:", err));
}