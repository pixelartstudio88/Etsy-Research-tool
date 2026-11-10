import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// The ?inline suffix is critical for Vite to output the CSS as a raw string for the Shadow DOM
import appStyles from './App.css?inline'; 

// ==========================================
// 1. DATA SCRAPING LOGIC
// ==========================================
function scrapeVisibleListings() {
  const listings = [];
  // Etsy's DOM classes change periodically; these are the standard current selectors
  const listingCards = document.querySelectorAll('.v2-listing-card'); 

  listingCards.forEach(card => {
    const titleEl = card.querySelector('.v2-listing-card__title');
    const priceEl = card.querySelector('.currency-value');
    const linkEl = card.querySelector('a.listing-link');
    const imgEl = card.querySelector('img'); // Grabbing the thumbnail image
    
    if (titleEl && priceEl && linkEl) {
      const url = linkEl.href;
      const listingIdMatch = url.match(/listing\/(\d+)/);
      
      listings.push({
        id: listingIdMatch ? listingIdMatch[1] : null,
        title: titleEl.innerText.trim(),
        price: parseFloat(priceEl.innerText.replace(/,/g, '')),
        url: url,
        image: imgEl ? imgEl.src : null
      });
    }
  });
  
  return listings;
}

// ==========================================
// 2. SHADOW DOM INITIALIZATION
// ==========================================
const hostElement = document.createElement('div');
hostElement.id = 'etsy-analyzer-host';

// Fixed positioning ensures the host covers the viewport but allows clicks to pass through
hostElement.style.position = 'fixed';
hostElement.style.top = '0';
hostElement.style.right = '0';
hostElement.style.zIndex = '2147483647'; // Maximum z-index
hostElement.style.pointerEvents = 'none'; // 'auto' is applied inside the React component when open

document.body.appendChild(hostElement);

// Create the isolated shadow boundary
const shadowRoot = hostElement.attachShadow({ mode: 'open' });

// ==========================================
// 3. CSS INJECTION
// ==========================================
const styleElement = document.createElement('style');
styleElement.textContent = `
  /* CSS Reset to clear browser defaults */
  :host {
    all: initial; 
  }
  #react-root {
    width: 100%;
    height: 100%;
  }
  * {
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  /* Inject the bundled CSS from Vite */
  ${appStyles}
`;
shadowRoot.appendChild(styleElement);

// ==========================================
// 4. REACT MOUNTING
// ==========================================
const reactRootElement = document.createElement('div');
reactRootElement.id = 'react-root';
shadowRoot.appendChild(reactRootElement);

const root = createRoot(reactRootElement);

// We pass the scraper function into the React App as a prop. 
// This allows the user to click an "Analyze Page" button inside the React UI 
// to trigger the scrape and send the data to the backend.
root.render(<App scrapeListings={scrapeVisibleListings} />);