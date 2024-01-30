document.addEventListener('DOMContentLoaded', async function () {
  let mlModelResponseData
  let contentPlaceholder = document.getElementById("content-loader")
  let constentStatus = document.getElementById("content-status")
  let stats = document.getElementById("statistics")

  // get if this active tab have any already set data
  const activeTab = await getActiveTabURL();

  if (activeTab.url && activeTab.url.includes("flipkart.com") && activeTab.url.includes("/p/")) {
    const keyToRetrieve = generateKeyForTab(activeTab.id)
    // Get data from chrome.storage.local for the specified key
    chrome.storage.local.get(keyToRetrieve, (result) => {
      const retrievedValue = result[keyToRetrieve];
      if (retrievedValue) {
        const sanatisedValue = JSON.parse(retrievedValue)
        if (sanatisedValue.length > 0) {
          mlModelResponseData = getStats(sanatisedValue)
          setStatistics(mlModelResponseData)
        }
      }
    });

  } else {
    setStatistics(mlModelResponseData)
  }


  function generateKeyForTab(tabId) {
    return `dataForTab_${tabId}`;
  }

  //updating the extension UI
  function getStats(sanatisedData) {
    let urgencyCount = 0
    let scarcityCount = 0
    let socialProofCount = 0;
    for (let i = 0; i < sanatisedData.length; i++) {
      if (sanatisedData[i].prediction == "Urgency") {
        urgencyCount++
      } else if (sanatisedData[i].prediction == "Scarcity") {
        scarcityCount++
      } else if (sanatisedData[i].prediction == "Social Proof") {
        socialProofCount++
      }
    }

    let statsData = {
      "total": sanatisedData.length,
      "urgency": urgencyCount,
      "scarcity": scarcityCount,
      "socialProof": socialProofCount
    }
    return statsData
  }

  async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
      currentWindow: true,
      active: true
    });
    return tabs[0];
  }

  function setStatistics(data) {
    contentPlaceholder.style.display = "none"
    constentStatus.textContent = "Reports"
    if (data) {
      stats.innerHTML = `<h4><strong>Total word nodes analysed: </strong> ${data.total}</h4>
                      <hr>
                      <div class="alert alert-danger" role="alert">
                        Urgencies found: ${data.urgency}
                      </div>
                      <div class="alert alert-warning" role="alert">
                          Warnings found: ${data.scarcity}
                      </div>
                      <div class="alert alert-primary" role="alert">
                        Social Proofs: ${data.socialProof}
                      </div>
                      `
    } else {
      stats.innerHTML = `<div class="alert alert-success" role="alert">
                                Not a product page
                        </div>`
    }
  }

});


