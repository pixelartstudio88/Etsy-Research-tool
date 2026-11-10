// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeListings") {
    const apiUrl = "http://127.0.0.1:8000/api/estimates";

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ listings: request.payload }) 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Explicitly reply to the content script with the data
        sendResponse({ success: true, data: data.data || data });
      })
      .catch((error) => {
        console.error("Fetch error in background script:", error);
        sendResponse({ success: false, error: error.message });
      });

    // IMPORTANT: Returning true keeps the message channel open 
    // during the asynchronous API fetch.
    return true; 
  }
});