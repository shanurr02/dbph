let allNodes
let paragraphNodes
let spanNodes

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startDataScraping') {
    // Step 1: Perform data scraping
    const scrapedData = scrapeData();

    // Step 2: Send message to background indicating data scraping completion
    chrome.runtime.sendMessage({ action: 'dataScraped', data: scrapedData });

  } else if (message.action === 'mlModelResponse') {
    // Step 3: Handle ML model response in content.js
    const sanatisedData= JSON.parse(message.data)
    for (let i = 0; i < allNodes.length; i++) {
      if (sanatisedData[i].prediction == "Urgency") {
        allNodes[i].style.border = '5px solid red';
      }else if(sanatisedData[i].prediction == "Scarcity"){
        allNodes[i].style.border = '5px solid orange';
      }else if(sanatisedData[i].prediction == "Social Proof"){
        allNodes[i].style.border = '5px solid blue';
      }
    }
  }
});


function scrapeData() {
  var paragraphsContent = []
  paragraphNodes = document.getElementsByTagName('p')

  for (var i = 0; i < paragraphNodes.length; i++) {
    paragraphsContent.push([i, paragraphNodes[i].textContent])
  }
  var spanContent = []
  spanNodes = document.getElementsByTagName('span')

  for (var i = 0; i < spanNodes.length; i++) {
    spanContent.push([i, spanNodes[i].textContent])
  }
  allNodes = [...paragraphNodes,...spanNodes]
  return paragraphsContent.concat(spanContent)
}

