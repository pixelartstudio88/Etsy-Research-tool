import React, { useState } from 'react';

const App = ({ scrapeListings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);

  const handleAnalyze = () => {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);

    try {
      const scrapedData = scrapeListings();

      if (!scrapedData || scrapedData.length === 0) {
        setError("No listings found on this page. Make sure you are on an Etsy search page.");
        setIsLoading(false);
        return;
      }

      chrome.runtime.sendMessage(
        { action: "analyzeListings", payload: scrapedData },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Extension Error:", chrome.runtime.lastError.message);
            setError("Failed to connect to the background worker.");
            setIsLoading(false);
            return;
          }

          if (response && response.success) {
            // Aggressively ensure the data is an array before setting state
            let listData = Array.isArray(response.data) 
              ? response.data 
              : (response.data?.data || []);
              
            if (!Array.isArray(listData)) {
              listData = [];
            }

            setListings(listData);
          } else {
            setError(response?.error || "Failed to fetch estimates from backend.");
            setListings([]); // Reset to empty array on error
          }
          
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.error("Scraping Error:", err);
      setError("An error occurred while scraping the page.");
      setIsLoading(false);
      setListings([]); // Reset to empty array on error
    }
  };

  // -------------------------------------------------------------
  // DEFENSIVE RENDER CHECK:
  // Guarantee we have an array before attempting to map over it.
  // -------------------------------------------------------------
  const safeListings = Array.isArray(listings) ? listings : [];

  return (
    <>
      {!isOpen && (
        <button 
          onClick={handleAnalyze}
          style={{
            pointerEvents: 'auto',
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            padding: '12px 24px',
            backgroundColor: '#F1641E', 
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: 'pointer',
            zIndex: 9999
          }}
        >
          🔍 Analyze Search
        </button>
      )}

      {isOpen && (
        <div style={{ 
          pointerEvents: 'auto',
          position: 'fixed',
          top: '0',
          right: '0',
          width: '450px',
          height: '100vh',
          background: '#ffffff', 
          boxShadow: '-4px 0 15px rgba(0,0,0,0.15)', 
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '20px',
            borderBottom: '1px solid #e1e3df'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#222' }}>Market Analyzer</h2>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ padding: '6px 12px', background: '#f4f4f4', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>

          <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                <p>Analyzing listings and fetching estimates...</p>
              </div>
            ) : error ? (
              <div style={{ color: '#d93025', background: '#fce8e6', padding: '15px', borderRadius: '6px' }}>
                {error}
              </div>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e1e3df', color: '#595959', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 4px' }}>Listing</th>
                    <th style={{ padding: '10px 4px' }}>Price</th>
                    <th style={{ padding: '10px 4px' }}>Est. Sales / Mo</th>
                  </tr>
                </thead>
                <tbody>
                  {safeListings.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#777' }}>
                        No data available.
                      </td>
                    </tr>
                  ) : (
                    safeListings.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e1e3df', fontSize: '13px' }}>
                        <td style={{ padding: '12px 4px', color: '#222', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item?.image && (
                            <img src={item.image} alt="Thumbnail" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                          )}
                          <span style={{ display: 'block', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item?.title || `Listing ${item?.id || 'Unknown'}`}
                          </span>
                        </td>
                        <td style={{ padding: '12px 4px', fontWeight: 'bold' }}>
                          ${typeof item?.price === 'number' ? item.price.toFixed(2) : '0.00'}
                        </td>
                        <td style={{ padding: '12px 4px', color: '#008a00', fontWeight: 'bold' }}>
                          {item?.estimatedSales || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default App;