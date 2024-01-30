chrome.webNavigation.onCompleted.addListener((details) => {
  const tabId = details.tabId;
  const tabUrl = details.url;

  if (tabUrl && tabUrl.includes("flipkart.com") && tabUrl.includes("/p/")) {
    // Step 1: Send message to content script to initiate data scraping
    chrome.tabs.sendMessage(tabId, { action: 'startDataScraping' });
  }

  // Step 2: Receive message from content script indicating data scraping completion
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'dataScraped' && sender.tab) {
      const tabId = sender.tab.id;

      // Step 3: Make ML model API call
      try {
        const mlModelResponse = await makeMLModelAPICall(message.data);

        // Step 4: Send ML model response to content script
        chrome.tabs.sendMessage(tabId, { action: 'mlModelResponse', data: mlModelResponse });

        // Step 5: Save the model data for the popup.js
        const keyForTab = `dataForTab_${tabId}`;
        chrome.storage.local.set({ [keyForTab]: mlModelResponse }, () => {
        });
      } catch (error) {
        console.error('Error in ML model API call:', error);
      }
    }
    return true
  });
});


// makeMLModelAPICall call the ML model via an API endpoint
async function makeMLModelAPICall(data) {
  try {
    const response = await fetch("https://dbph-proxy-opg6dpgh6q-em.a.run.app/predict_text", {
      method: 'post',
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const output = await response.json();
    console.log("Model output:", output);
    return output;
  } catch (error) {
    console.error("Error making API call:", error.message);
    throw error;
  }
}

// Free the data of the tabs that have been closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  const dataToRemoveKey = generateKeyForTab(tabId);
  chrome.storage.local.remove(dataToRemoveKey, () => {
    console.log(`Data for tab ${tabId} removed from local storage`);
  });
});

function generateKeyForTab(tabId) {
  return `dataForTab_${tabId}`;
}

