# VoteWise – Election Education Assistant

VoteWise is a modern, interactive web-based AI assistant designed to help users understand the election process in a simple, visual, and engaging way.

demo link : https://keen-fox-522faf.netlify.app/
## Features

- **AI Chat Assistant**: Ask any election-related questions and get structured, easy-to-follow answers powered by Google's Gemini API.
- **Election Step Guide**: A clear, step-by-step interactive card layout outlining the general election process (Registration, Verification, Voting Day, Counting).
- **Eligibility Checker**: A quick form to check basic voter eligibility based on age, citizenship, and felony status.
- **Timeline Visualizer**: A visual timeline showing the chronological phases of an election cycle.
- **FAQs**: Expandable definitions and common questions regarding voting procedures.

## Google Services Used

- **Google Gemini API**: Provides the intelligence behind the Chatbot, offering conversational election education.
- **Firebase Firestore**: Configured (via placeholder) to store anonymized user queries for analytics and improving the bot.
- **Firebase Hosting**: Ideal for deploying this lightweight static web app.
- **Google Analytics**: Integrated to track basic web traffic and user interactions.

## Setup Instructions

This project requires zero build steps and uses vanilla web technologies.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
2. **Open the project:**
   Simply run a local http server like `python -m http.server` and visit your localhost.
3. **Configure API Keys:**
   - Make sure you place your Gemini API key securely inside your local `config.js` file that does not get synced to git.
   - Replace the `firebaseConfig` properties with your Firebase project credentials to enable query tracking.
   - Replace `G-XXXXXXXXXX` in `index.html` with your real Google Analytics tag.
4. **Deployment:**
   You can easily deploy this using Firebase Hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```
   

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- APIs: Google Gemini v1.5 Flash
- Backend / Database: Firebase (Firestore) - optional logging

## Design Assets & Aesthetics
- Google Fonts: 'Inter' for clean typography.
- Icons: FontAwesome.
- Responsive layout with mobile-ready sidebar drawer.
