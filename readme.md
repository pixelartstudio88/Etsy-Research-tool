📊 Etsy Market Analyzer
A full-stack Chrome extension and API backend designed to provide Etsy sellers with data-driven insights, listing optimization intelligence, and estimated sales velocity using the official Etsy v3 API.

Architecture
This project is split into two distinct environments to safely bypass browser CORS restrictions, secure API credentials, and manage heavy computational tasks without degrading browser performance.

Frontend (/extension): A Manifest V3 Chrome Extension built with React and Vite. It utilizes a Shadow DOM overlay to isolate its UI from Etsy's native styles and relies on a background service worker to communicate securely with the local backend.

Backend (/backend): A Python FastAPI server that acts as the computation engine. It securely stores the Etsy API Keystring, handles concurrent API requests to Etsy's v3 endpoints, and executes the Review-to-Sales estimation algorithm.

Prerequisites
Node.js & npm (for building the Chrome extension)

Python 3.8+ (for running the FastAPI server)

Etsy Developer API Key (Keystring) from the Etsy Developer Portal

Installation & Setup
1. Backend Setup (FastAPI)
The backend server must be running to process requests from the Chrome extension and securely communicate with the Etsy API.

Open your terminal and navigate to the backend directory:

Bash


cd backend
Install the required Python dependencies:

Bash


pip install -r requirements.txt
Open main.py and replace "YOUR_ETSY_KEYSTRING_HERE" with your actual API key from the Etsy Developer Portal.

Start the local server:

Bash


uvicorn main:app --reload --host localhost --port 8000
(The server will run on http://localhost:8000)

2. Frontend Setup (Chrome Extension)
The Vite React app must be compiled into standard JavaScript and HTML before Google Chrome can install it.

Open a new terminal window and navigate to the extension directory:

Bash


cd extension
Install the Node dependencies:

Bash


npm install
Compile the production build:

Bash


npm run build
(This generates a new dist/ folder containing the ready-to-use extension)

3. Loading the Extension into Chrome
Open Google Chrome and navigate to chrome://extensions/.

Toggle Developer mode ON in the top right corner.

Click the Load unpacked button in the top left.

Select the newly generated extension/dist folder on your computer.

Usage
Ensure the Python FastAPI server is actively running in your terminal.

Navigate to any search or marketplace page on Etsy.com.

A floating orange 🔍 Analyze Search button will appear in the bottom right corner of the window.

Click the button to trigger the scraping tool. A slide-out panel will appear, displaying the listings, prices, and their estimated monthly sales velocity powered by your local backend.

Disclaimer
The term 'Etsy' is a trademark of Etsy, Inc. This application uses the Etsy API but is not endorsed or certified by Etsy, Inc. Ensure you comply with Etsy's API Terms of Use regarding request rate limits and data storage policies.