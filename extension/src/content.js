import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import appStyles from './App.css?inline'; 

// ==========================================
// 1. DATA SCRAPING LOGIC
// ==========================================
function scrapeVisibleListings() {
  const listings = [];
  const listingCards = document.querySelectorAll('.v2-listing-card'); 

  listingCards.forEach(card => {
    const titleEl = card.querySelector('.v2-listing-card__title');
    const priceEl = card.querySelector('.currency-value');
    const linkEl = card.querySelector('a.listing-link');
    const imgEl = card.querySelector('img'); 
    
    if (titleEl && linkEl) {
      const url = linkEl.href;
      const listingIdMatch = url.match(/listing\/(\d+)/);
      
      // Safely parse the price to prevent NaN crashes in React
      let price = 0;
      if (priceEl) {
        const parsed = parseFloat(priceEl.innerText.replace(/,/g, ''));
        price = isNaN(parsed) ? 0 : parsed;
      }
      
      listings.push({
        id: listingIdMatch ? listingIdMatch[1] : null,
        title: titleEl.innerText.trim(),
        price: price,
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
hostElement.style.position = 'fixed';
hostElement.style.top = '0';
hostElement.style.right = '0';
hostElement.style.zIndex = '2147483647'; 
hostElement.style.pointerEvents = 'none'; 

document.body.appendChild(hostElement);
const shadowRoot = hostElement.attachShadow({ mode: 'open' });

// ==========================================
// 3. CSS INJECTION (Using standard concatenation)
// ==========================================
const styleElement = document.createElement('style');
styleElement.textContent = "/* CSS Reset */ :host { all: initial; } #react-root { width: 100%; height: 100%; } * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }\n" + (appStyles || "");
shadowRoot.appendChild(styleElement);

// ==========================================
// 4. REACT MOUNTING & ERROR BOUNDARY
// ==========================================
const reactRootElement = document.createElement('div');
reactRootElement.id = 'react-root';
shadowRoot.appendChild(reactRootElement);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.toString() };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ pointerEvents: 'auto', position: 'fixed', bottom: '30px', right: '30px', background: '#fce8e6', color: '#d93025', padding: '15px', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <strong>Extension UI Crashed:</strong><br/>{this.state.errorMsg}
        </div>
      );
    }
    return this.props.children;
  }
}

const root = createRoot(reactRootElement);
root.render(
  <ErrorBoundary>
    <App scrapeListings={scrapeVisibleListings} />
  </ErrorBoundary>
);